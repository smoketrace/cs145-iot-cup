import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAORQ_IaDvP8vyLhdPAitFBgNcYgFqxt4g",
  authDomain: "smoketrace-145.firebaseapp.com",
  projectId: "smoketrace-145",
  storageBucket: "smoketrace-145.appspot.com",
  messagingSenderId: "921150291554",
  appId: "1:921150291554:web:f443c1e1fc2bc950df1b3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);