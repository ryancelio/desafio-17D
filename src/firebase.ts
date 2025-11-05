// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKXTjnLNiwyowcqMiwOw9ZTI3ySXNdZS4",
  authDomain: "desafio-19d.firebaseapp.com",
  projectId: "desafio-19d",
  storageBucket: "desafio-19d.firebasestorage.app",
  messagingSenderId: "1007131773531",
  appId: "1:1007131773531:web:e22e177bd853f53e198d7e",
  measurementId: "G-3QW0BB7QZJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
