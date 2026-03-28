// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkdaEoVcvqkex28gAthCrPmDPnBw0bYbc",
  authDomain: "ske-website-e455a.firebaseapp.com",
  projectId: "ske-website-e455a",
  storageBucket: "ske-website-e455a.firebasestorage.app",
  messagingSenderId: "531148870480",
  appId: "1:531148870480:web:1afc3b0beaa10a9e5c1255"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
