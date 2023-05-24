import { Application, Router, send } from "https://deno.land/x/oak@v12.4.0/mod.ts";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { collection, getFirestore, addDoc, doc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { oakCors } from "https://deno.land/x/cors/mod.ts";


const firebaseConfig = JSON.parse(Deno.env.get("FIREBASE_CONFIG"));

// Dictionary to store device timers
const devices = new Map<string, ReturnType<typeof setTimeout>>(); // Create a device map that stores the timeout handlers for each device

const firebaseApp = initializeApp(firebaseConfig, "smoketrace-145");
const db = getFirestore(firebaseApp);

type sensorData = {
    device_id: string;
    smoke_read: number;
    time: string;
};

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
            const device_timer = devices.get(device_id); // Obtain the handler identifier stored in the device map
            clearTimeout(device_timer); // Deactivate timer set with handler identifier stored in the device map
        }

        // Allocate new asynchronous timer to the device
        devices.set(device_id, setTimeout(() => {
            console.log(`${device_id} did not respond for 15 seconds`); // Print to console upon 15 seconds of not POST-ing
        }, 15000)); // Set timeout for 15 seconds

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
