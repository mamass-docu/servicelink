import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClDXWMCEVWQuamBLVKnQdXG1n4PlpiJFs",
  authDomain: "service-link-d7b4e.firebaseapp.com",
  projectId: "service-link-d7b4e",
  storageBucket: "service-link-d7b4e.firebasestorage.app",
  messagingSenderId: "849305888050",
  appId: "1:849305888050:web:f9e38748c2c47e22aaa32b",
  databaseURL: "https://service-link-d7b4e-default-rtdb.firebaseio.com", // Add this if you have Realtime Database
};

const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

const auth = getAuth(app);

const db = getFirestore(app);

export { db, auth };
