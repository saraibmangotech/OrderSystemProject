// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBo3bHyfYYtBBeYAFt6_sV9iWqLF_bYwuY",
  authDomain: "scanserve-app.firebaseapp.com",
  projectId: "scanserve-app",
  storageBucket: "scanserve-app.firebasestorage.app",
  messagingSenderId: "124173740082",
  appId: "1:124173740082:web:bac36fceefbd378f08742b",
  measurementId: "G-QMVKLQTXFH"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const messagingPromise = isSupported().then((supported) =>
  supported ? getMessaging(app) : null
);