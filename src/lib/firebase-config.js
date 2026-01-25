// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3N0tdGMJILcDA0O6ohL_8fleRdjG0RqE",
  authDomain: "bidan-wahyu-app-qboq1.firebaseapp.com",
  projectId: "bidan-wahyu-app-qboq1",
  storageBucket: "bidan-wahyu-app-qboq1.firebasestorage.app",
  messagingSenderId: "862611359977",
  appId: "1:862611359977:web:4eb19ce62f70d604508878"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);