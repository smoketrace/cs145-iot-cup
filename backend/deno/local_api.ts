import { Application, Router, send } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { connectFirestoreEmulator, getFirestore, collection, getDoc, setDoc, addDoc, updateDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { connectDatabaseEmulator, getDatabase, push, set, ref, child, get, orderByChild, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { TwilioSMS, SMSRequest } from './twilio/twilioSMS.ts';

const firebaseConfig = JSON.parse(Deno.env.get("FIREBASE_CONFIG"));
const firebaseApp = initializeApp(firebaseConfig, "smoketrace-145");
const db = getFirestore(firebaseApp);
const real_db = getDatabase(firebaseApp);

// For local database testing
connectDatabaseEmulator(real_db, 'localhost', 9000);
connectFirestoreEmulator(db, 'localhost', 8080);

// Twilio SMS Credentials
const accountSid: string = <string>(
  Deno.env.get('TWILIO_ACCOUNT_SID')
);
const keySid: string = <string>(
  Deno.env.get('TWILIO_API_KEY')
);
const secret: string = <string>(
  Deno.env.get('TWILIO_API_SECRET')
);
const fromPhoneNumber: string = <string>(
  Deno.env.get('TWILIO_FROM_PHONE_NUMBER')
);
const toPhoneNumber: string = <string>(
  Deno.env.get('TWILIO_TO_PHONE_NUMBER')
);

// Create helper variable for Twilio SMS service
const helper = new TwilioSMS(accountSid, keySid, secret);

// Add type to contain sensor data from ESP32
type sensorData = {
    device_id: string;
    smoke_read: number;
    time: number;
};

// Add type to contain phone directory data from website
type phoneDirectoryData = {
    phone: string;
    name: string;
};

// Define status constants for deviceInfo type
enum STATUS {
    GREEN,
    ORANGE,
    RED,
    BLACK,
    RECON,
    SMS,
}

// Define smoke tolerance
const SMOKE_TOLERANCE = 384;

// Define deviceInfo type for containing device status and information
type deviceInfo = {
    status: number; // Perceived status of the device
    last_read: number; // Last smoke_read of the device
    last_alive: number; // Last time the device sent a POST message to the server
    status_timeout_handler: ReturnType<typeof setTimeout>; // Timeout handler for the device status
    sms_timeout_handler: ReturnType<typeof setTimeout>; // Timeout handler for the SMS service
    sms_timeout_running: boolean; // Check if the SMS timeout handler is running
};

// Dictionary to store device timers
const devices = new Map<string, deviceInfo>(); // Create a device map that stores the timeout handlers for each device

// Create instance of App Server
const app = new Application();
app.use(oakCors());

// Response time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
  });

// Create instance of Router (routes HTTP requests)
const router = new Router();

router
    .get('/', (context) => {
        context.response.body = 'This is the API homepage! 💜🔥🍺';
    })
    .get('/sensors', async (context) => {
        try {
            const target = context.sendEvents();
            const sensor_ref = query(ref(real_db, 'sensorData'), orderByChild("time"), limitToLast(25));
            onValue(sensor_ref, (snapshot) => {
                const array = Object.values(snapshot.val());
                console.log(array);
                target.dispatchMessage(array);
            });
        } catch (e) {
            console.log(e);
            context.response.body = "Something went wrong!";
        }
    })
    .get('/sensors/:device_id', async (context) => {
        if (context.params && context.params.device_id) {
            const { device_id: ref_dev } = context.params;
            try {
                const sensor_ref = query(ref(real_db, 'sensorData'), orderByChild("time"), limitToLast(25));
                const values = await get(sensor_ref).then((snapshot) => {
                    return snapshot.val();
                })
                const array = Object.values(values);
                const filtered = array.filter(({ device_id: dev, smoke_read, time }) => dev == ref_dev);
                context.response.body = filtered;
            } catch (e) {
                console.log(e);
                context.response.body = "Something went wrong!";
            }
        }
    })
    .get('/sensors/:device_id/data', (context) => {
        if (context.params && context.params.device_id) {
            const { device_id } = context.params;
           try {
                const sensor = devices.get(device_id);

                if (sensor) {
                    context.response.body = sensor;
                } else {
                    context.response.body = "Sensor not found.";
                }

           } catch (e) {
                console.log(e);
                context.response.body = "Something went wrong!"
           }
        }
    })
    .post('/sensors', async (context) => {
        const { device_id, smoke_read, time } = await context.request.body({ type: 'json' }).value;

        // Case handling if device id or time is blank - maybe change to case if received info is incorrect?
        if (!device_id || !time) {
            context.response.body = "Sensor data cannot be uploaded! 😭"
            context.response.status = 400;
            return;
        }

        // Refresh timer for device_id if the device already exists in the device map
        if (devices.has(device_id)){ // If the device ID already exists in the device map
            const device_timer: ReturnType<typeof setTimeout> = devices.get(device_id).status_timeout_handler; // Obtain the timeout handler identifier stored in the device map
            clearTimeout(device_timer); // Deactivate timer set with timeout handler identifier stored in the device map
        }

        // Create timeout handler for ORANGE/BLACK device status, if device status is currently GREEN/RED
        const status_timeout_handler = setTimeout(() => { // Set timeout handler
            (devices.get(device_id).status == RED // Check last device status
                ? (devices.get(device_id).status = BLACK) // Transition to BLACK status if the last status is RED after timeout
                : (devices.get(device_id).status = ORANGE) // Else, just transition to ORANGE status
            ); // If the timer expires, set the device status to ORANGE 
            console.log(`${device_id} did not respond for 15 seconds`); // Print to console upon 15 seconds of not POST-ing (debug)
            console.log(devices.get(device_id)); // Print to console about the latest device information of the unresponsive device
            // Code for sending a mandatory ORANGE/BLACK packet to the front end
            const newSensorData: sensorData = {
                status: devices.get(device_id).status, // either BLACK or ORANGE
                device_id,
                smoke_read,
                time,
            };
            const post_ref = push(ref(real_db, 'sensorData'));
            await set(post_ref, newSensorData);
        }, 15000); // Set timeout for 15 seconds

        // Set current status based on smoke_read or reconnection
        const status = () => {
            switch(devices.get(device_id).status){
                case ORANGE:
                case BLACK:
                    return RECON;
            if (smoke_read >= SMOKE_TOLERANCE) {
                return RED;
            }
            return GREEN;
        }

        // Obtain previous sms_timeout_handler from the device map, if exists
        // Else, set sms_timeout_handler and sms_timeout_running to 0 and false, respectively
        let sms_timeout_handler = 0;
        let sms_timeout_running = false;
        if (devices.has(device_id)){
            sms_timeout_handler = devices.get(device_id).sms_timeout_handler;
            sms_timeout_running = devices.get(device_id).sms_timeout_running;
        }

        // Create timeout handler for the SMS service
        switch(status){
            case RED: // Send status-based SMS for RED device status
                if(!sms_timeout_running){
                    sms_timeout_handler = setTimeout(() => { // Set timeout handler
                        const message: SMSRequest = {
                            From: fromPhoneNumber,
                            To: toPhoneNumber,
                            Body: `${device_id} has a HIGH reading for 15s already.`, // Initialize string for body
                        };
                        helper.sendSms(message).subscribe(console.log); // Send SMS message for continuous RED readings
                        console.log(`${device_id} has a HIGH reading for 15s already. SMS sent.`); // Print to console upon 15 seconds of continuous HIGH smoke readings
                        console.log(devices.get(device_id)); // Print to console about the latest device information of the continuously RED device
                        // Create new sensor data with SMS label
                        const newSensorData: sensorData = {
                            status: SMS,
                            device_id,
                            smoke_read,
                            time,
                        };
                        const post_ref = push(ref(real_db, 'sensorData'));
                        await set(post_ref, newSensorData);
                    }, 15000); // Set timeout for 15 seconds
                    sms_timeout_running = true;
                }
                break;
            case RECON: // Abort SMS sending timeout if status is RECON
            case GREEN: // Also abort SMS sending timeout if status is GREEN
                if(sms_timeout_running){
                    console.log(devices.get(device_id));
                    clearTimeout(sms_timeout_handler);
                    sms_timeout_running = false;
                }
                break;
        }

        // Create mutable deviceInfo entry of device_id in the device map
        const device_info: deviceInfo = {
            status, // Set status to GREEN upon receiving the POST request
            last_read: smoke_read, // Set last_read to received smoke_read
            last_alive: time, // Set last_alive to received time
            status_timeout_handler, // Store the timeout handler for the device status
            sms_timeout_handler, // Store the timeout handler for the SMS service
            sms_timeout_running, // Store the variable that checks if the SMS timeout handler is running
        };

        // Update device information of the device in the device map
        devices.set(device_id, device_info); // Set timeout for 15 seconds

        // Create new sensor data
        const newSensorData: sensorData = {
            status,
            device_id,
            smoke_read,
            time,
        };

        const post_ref = push(ref(real_db, 'sensorData'));
        await set(post_ref, newSensorData);

        context.response.body = "Sensor data uploaded! 😁"
        context.response.status = 201;
    })
    .post('/phone-directory', async (context) => {
        const { phone, name, devices } = await context.request.body({ type: 'json' }).value;
        try {
            const phone_entry = await getDoc(doc(db, "phoneDirectoryData", phone));
            if (phone_entry.exists()) {
                const update_field = {
                    name,
                    devices
                }
                await updateDoc(doc(db, 'phoneDirectoryData', phone), update_field);
            }
            else {
                // Create new phone directory data
                const new_phone_directory_data: phoneDirectoryData = {
                    phone,
                    name,
                    devices
                };
                await setDoc(doc(db, 'phoneDirectoryData', phone), new_phone_directory_data);
            }
        } catch (e) {
            console.log(e);
            context.response.body = "Something went wrong!"
        }
        context.response.body = "Phone directory data uploaded! 😁"
        context.response.status = 201;
    });

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
