import { Application, Router, ServerSentEvent } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { connectFirestoreEmulator, getFirestore, collection, getDoc, setDoc, addDoc, updateDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { connectDatabaseEmulator, getDatabase, push, set, ref, child, get, orderByChild, limitToLast, onValue, DataSnapshot } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const firebaseConfig = JSON.parse(Deno.env.get("FIREBASE_CONFIG"));
const firebaseApp = initializeApp(firebaseConfig, "smoketrace-145");
const db = getFirestore(firebaseApp);
const real_db = getDatabase(firebaseApp);

// For local database testing
connectDatabaseEmulator(real_db, 'localhost', 9000);
connectFirestoreEmulator(db, 'localhost', 8080);

// Semaphore SMS Credentials
const apiKey: string = <string>(
  Deno.env.get('API_KEY')
);

// Add type to contain pure sensor data from ESP32
type sensorData = {
    device_id: string;
    smoke_read: number;
    time: number;
};

// Add type to contain sensor status for incident logs
type sensorStatus = {
    status: STATUS;
    device_id: string;
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
    FIRE,
}

// Define smoke tolerance
const SMOKE_TOLERANCE = 384;

// Define deviceInfo type for containing device status and information
type deviceInfo = {
    status: STATUS; // Perceived status of the device
    last_read: number; // Last smoke_read of the device
    last_alive: number; // Last time the device sent a POST message to the server
    status_timeout_handler: ReturnType<typeof setTimeout>; // Timeout handler for the device status
    sms_timeout_handler: ReturnType<typeof setTimeout>; // Timeout handler for the SMS service
    sms_timeout_running: boolean; // Check if the SMS timeout handler is running
    fire_timeout_handler: ReturnType<typeof setTimeout>; // Timeout handler for the FIRE pop up
    fire_timeout_running: boolean; // Check if the FIRE pop up timeout handler is running
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
            const status_ref = query(ref(real_db, 'sensorStatus'), orderByChild("time"), limitToLast(25));
            onValue(sensor_ref, (sensor_snapshot: DataSnapshot) => {
                const sensor_array = (() => {
                    if (sensor_snapshot.exists()) { return Object.values(sensor_snapshot.val()); }
                    return [];
                })();
                const sensor_event = new ServerSentEvent("sensor", {
                    data: JSON.stringify(sensor_array),
                });
                console.log(sensor_array);
                target.dispatchEvent(sensor_event);
            });
            onValue(status_ref, (status_snapshot: DataSnapshot) => {
                const status_array = (() => {
                    if (status_snapshot.exists()) { return Object.values(status_snapshot.val()); }
                    return [];
                })();
                const status_event = new ServerSentEvent("status", {
                    data: JSON.stringify(status_array),
                });
                console.log(status_array);
                target.dispatchEvent(status_event);
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
                const values = await get(sensor_ref).then((snapshot: DataSnapshot) => {
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
            // If device is reconnected, send a RECON status to the database
            switch(devices.get(device_id).status){
                case STATUS.BLACK:
                case STATUS.ORANGE:
                    const newSensorStatus: sensorStatus = {
                        status: STATUS.RECON, // RECON status
                        device_id,
                        time,
                    };
                    const post_ref = push(ref(real_db, 'sensorStatus'));
                    await set(post_ref, newSensorStatus);
            }
            const device_timer: ReturnType<typeof setTimeout> = devices.get(device_id).status_timeout_handler; // Obtain the timeout handler identifier stored in the device map
            clearTimeout(device_timer); // Deactivate timer set with timeout handler identifier stored in the device map
        }

        // Create timeout handler for ORANGE/BLACK device status, if device status is currently GREEN/RED
        const status_timeout_handler = setTimeout(async () => { // Set timeout handler
            (devices.get(device_id).status == STATUS.RED // Check last device status
                ? (devices.get(device_id).status = STATUS.BLACK) // Transition to BLACK status if the last status is RED after timeout
                : (devices.get(device_id).status = STATUS.ORANGE) // Else, just transition to ORANGE status
            ); // If the timer expires, set the device status to ORANGE
            console.log(`${device_id} did not respond for 15 seconds`); // Print to console upon 15 seconds of not POST-ing (debug)
            console.log(devices.get(device_id)); // Print to console about the latest device information of the unresponsive device
            // Code for sending a mandatory ORANGE/BLACK packet to the front end
            if(devices.has(device_id)){
                console.log(devices.get(device_id).status);

                // Update device map
                const device_info: deviceInfo = {
                    status: devices.get(device_id).status, // either BLACK or ORANGE
                    last_read: devices.get(device_id).last_read, // Set last_read to old smoke_read
                    last_alive: devices.get(device_id).last_alive, // Set last_alive to old time
                    status_timeout_handler: devices.get(device_id).status_timeout_handler, // Capture the old timeout handler for the device status
                    sms_timeout_handler: devices.get(device_id).sms_timeout_handler, // Capture the old timeout handler for the SMS service
                    sms_timeout_running: devices.get(device_id).sms_timeout_running, // Capture the old variable that checks if the SMS timeout handler is running
                };

                // Update device information of the device in the device map
                devices.set(device_id, device_info); // Replace device status

                const newSensorStatus: sensorStatus = {
                    status: devices.get(device_id).status, // either BLACK or ORANGE
                    device_id,
                    time,
                };
                const post_ref = push(ref(real_db, 'sensorStatus'));
                await set(post_ref, newSensorStatus);
            }
        }, 15000); // Set timeout for 15 seconds

        // Set current status based on smoke_read
        const status = smoke_read >= SMOKE_TOLERANCE ? STATUS.RED : STATUS.GREEN;

        // Obtain previous sms_timeout_handler from the device map, if exists
        // Else, set sms_timeout_handler and sms_timeout_running to 0 and false, respectively
        let sms_timeout_handler = 0;
        let sms_timeout_running = false;
        let fire_timeout_handler = 0;
        let fire_timeout_running = false;
        if (devices.has(device_id)){
            sms_timeout_handler = devices.get(device_id).sms_timeout_handler;
            sms_timeout_running = devices.get(device_id).sms_timeout_running;
            fire_timeout_handler = devices.get(device_id).fire_timeout_handler;
            fire_timeout_running = devices.get(device_id).fire_timeout_running;
        }

        // Create timeout handler for the SMS service
        switch(status){
            case STATUS.RED: // Send status-based SMS for RED device status
                if(!sms_timeout_running){
                    sms_timeout_handler = setTimeout(async () => { // Set timeout handler
                        const phone_numbers_snapshot = await getDocs(collection(db, "phoneDirectoryData"));
                        phone_numbers_snapshot.forEach((doc) => {
                            const phone_data = doc.data();
                            fetch('https://semaphore.co/api/v4/messages', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                              },
                              body: `apikey=${apiKey} &number=${phone_data.phone}&message=Hi ${phone_data.name}! ${device_id} has a HIGH reading for 15s already.`
                            });
                        });
                        console.log(`${device_id} has a HIGH reading for 15s already. SMS sent.`); // Print to console upon 15 seconds of continuous HIGH smoke readings
                        console.log(devices.get(device_id)); // Print to console about the latest device information of the continuously RED device
                        const newSensorStatus: sensorStatus = {
                            status: STATUS.SMS,
                            device_id,
                            time,
                        };
                        const post_ref = push(ref(real_db, 'sensorStatus'));
                        await set(post_ref, newSensorStatus);
                    }, 15000); // Set timeout for 15 seconds
                    sms_timeout_running = true;
                }
                if(!fire_timeout_running){
                    fire_timeout_handler = setTimeout(async () => { // Set timeout handler
                        const newSensorStatus: sensorStatus = {
                            status: STATUS.FIRE,
                            device_id,
                            time,
                        };
                        const post_ref = push(ref(real_db, 'sensorStatus'));
                        await set(post_ref, newSensorStatus);
                    }, 300000); // Set timeout for 5 minutes
                    fire_timeout_running = true;
                }
                break;
            case STATUS.GREEN: // Also abort SMS sending timeout if status is GREEN
                if(sms_timeout_running){
                    console.log(devices.get(device_id));
                    clearTimeout(sms_timeout_handler);
                    sms_timeout_running = false;
                }
                if(fire_timeout_running){
                    console.log(devices.get(device_id));
                    clearTimeout(fire_timeout_handler);
                    fire_timeout_running = false;
                }
                break;
        }

        // Create mutable deviceInfo entry of device_id in the device map
        const device_info: deviceInfo = {
            status, // Set status to GREEN or RED upon receiving the POST request
            last_read: smoke_read, // Set last_read to received smoke_read
            last_alive: time, // Set last_alive to received time
            status_timeout_handler, // Store the timeout handler for the device status
            sms_timeout_handler, // Store the timeout handler for the SMS service
            sms_timeout_running, // Store the variable that checks if the SMS timeout handler is running
            fire_timeout_handler, // Store the timeout handler for the FIRE pop up
            fire_timeout_running, // Store the variable that checks if the FIRE pop up timeout handler is running
        };

        // Update device information of the device in the device map
        devices.set(device_id, device_info); // Set timeout for 15 seconds

        // Create new sensor data
        const newSensorData: sensorData = {
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
        const { phone, name } = await context.request.body({ type: 'json' }).value;
        try {
            const phone_entry = await getDoc(doc(db, "phoneDirectoryData", phone));
            if (phone_entry.exists()) {
                const update_field = {
                    name,
                }
                await updateDoc(doc(db, 'phoneDirectoryData', phone), update_field);
            }
            else {
                // Create new phone directory data
                const new_phone_directory_data: phoneDirectoryData = {
                    phone,
                    name,
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
