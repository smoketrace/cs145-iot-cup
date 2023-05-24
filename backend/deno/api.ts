import { Application, Router, send } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { collection, getFirestore, addDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const firebaseConfig = JSON.parse(Deno.env.get("FIREBASE_CONFIG"));
const firebaseApp = initializeApp(firebaseConfig, "smoketrace-145");
const db = getFirestore(firebaseApp);

type sensorData = {
    device_id: string;
    smoke_read: number;
    time: string;
};

// Define status constants for deviceInfo type
const GREEN = 0;
const ORANGE = 1;
const RED = 2;

// Define deviceInfo type for containing device status and information
type deviceInfo = {
    status: number; // Perceived status of the device
    last_read: number; // Last smoke_read of the device
    last_alive: string; // Last time the device sent a POST message to the server
    timeout_handler: ReturnType<typeof setTimeout>; // Timeout handler for the device
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
            const device_timer: ReturnType<typeof setTimeout> = devices.get(device_id).timeout_handler; // Obtain the timeout handler identifier stored in the device map
            clearTimeout(device_timer); // Deactivate timer set with timeout handler identifier stored in the device map
        }

        // Create timeout handler for the logged device
        const timeout_handler = setTimeout(() => {
            devices.get(device_id).status = ORANGE; // If the timer expires, set the device status to ORANGE
            console.log(`${device_id} did not respond for 15 seconds`); // Print to console upon 15 seconds of not POST-ing (debug)
            console.log(devices.get(device_id)); // Print to console about the latest device information of the unresponsive device
        }, 15000); // Set timeout for 15 seconds

        // Create mutable deviceInfo entry of device_id in the device map
        const device_info: deviceInfo = {
            GREEN, // Set status to GREEN upon receiving the POST request
            smoke_read, // Set last_read to received smoke_read
            time, // Set last_alive to received time
            timeout_handler, // Store the timeout handler for the current device
        };

        // Update device information of the device in the device map
        devices.set(device_id, device_info); // Set timeout for 15 seconds

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
