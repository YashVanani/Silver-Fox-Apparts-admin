import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwEqC-6TwH8q4x7O2rBRncPX_K1Y3KxFc",
  authDomain: "silverfoxapparts.firebaseapp.com",
  projectId: "silverfoxapparts",
  storageBucket: "silverfoxapparts.firebasestorage.app",
  messagingSenderId: "814480623394",
  appId: "1:814480623394:web:724ea868c2f3e9805f477b",
  measurementId: "G-0QFTR3VL6G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const storage = getStorage(app);

// Export
export { app, auth, db };
