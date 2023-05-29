import { Application, Router, send } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { collection, getFirestore, addDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { TwilioSMS, SMSRequest } from './twilio/twilioSMS.ts';

const firebaseConfig = JSON.parse(Deno.env.get("FIREBASE_CONFIG"));
const firebaseApp = initializeApp(firebaseConfig, "smoketrace-145");
const db = getFirestore(firebaseApp);

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
const phoneNumber: string = <string>(
  Deno.env.get('TWILIO_PHONE_NUMBER')
);

// Create helper variable for Twilio SMS service
const helper = new TwilioSMS(accountSid, keySid, secret);

// Setup SMS message body
const message: SMSRequest = {
  From: phoneNumber,
  To: '+15005550001', // test destination
};

// Add type to contain sensor data from ESP32
type sensorData = {
    device_id: string;
    smoke_read: number;
    time: string;
};

// Define status constants for deviceInfo type
const GREEN = 0;
const ORANGE = 1;
const RED = 2;
const BLACK = 3;

// Define smoke tolerance
const SMOKE_TOLERANCE = 150;

// Define deviceInfo type for containing device status and information
type deviceInfo = {
    status: number; // Perceived status of the device
    last_read: number; // Last smoke_read of the device
    last_alive: string; // Last time the device sent a POST message to the server
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
            const sensors = await getDocs(collection(db, "sensorData"));
            const data = sensors.docs.map((doc) => doc.data());
            context.response.body = data;
        } catch (e) {
            console.log(e);
            context.response.body = "Something went wrong!"
        }
    })
    .get('/sensors/:device_id', async (context) => {
        if (context.params && context.params.device_id) {
            const { device_id } = context.params;
           try {
                const sensorDataRef = collection(db, "sensorData");
                const dataQuery = query(sensorDataRef, where("device_id", "==", device_id));
                const sensor = await getDocs(dataQuery).then((querySnapshot) => {
                    const data = querySnapshot.docs.map((doc) => doc.data());
                    return data;
                })

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
        }, 15000); // Set timeout for 15 seconds

        // Set current status based on smoke_read
        const status = smoke_read >= SMOKE_TOLERANCE ? RED : GREEN;

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
                        message.body = "<device_id> has a HIGH reading for 15s already.";
                        helper.sendSms(message).subscribe(console.log); // Send SMS message for continuous RED readings
                        console.log(`${device_id} has a HIGH reading for 15s already. SMS sent.`); // Print to console upon 15 seconds of continuous HIGH smoke readings
                        console.log(devices.get(device_id)); // Print to console about the latest device information of the continuously RED device
                    }, 15000); // Set timeout for 15 seconds
                    sms_timeout_running = true;
                }
                break;
            case GREEN: // Abort SMS sending timeout if status is GREEN
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
        // console.log("RECENT POST DEVICE INFO:");
        // console.log(devices.get(device_id));

        // Case handling if device id or time is blank - maybe change to case if received info is incorrect?
        if (!device_id || !time) {
            context.response.body = "Sensor data cannot be uploaded! 😭"
            context.response.status = 400;
            return;
        }

        // creating new sensor data
        const newSensorData: sensorData = {
            device_id,
            smoke_read,
            time,
        };

        await addDoc(collection(db, 'sensorData'), newSensorData);
        context.response.body = "Sensor data uploaded! 😁"
        context.response.status = 201;
    });

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
