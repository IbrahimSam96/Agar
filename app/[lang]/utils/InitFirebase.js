// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC21KpIJcJRIj4xjXFw4z_QHS_I2H0ILBY",
  authDomain: "shoqaq-b1097.firebaseapp.com",
  projectId: "shoqaq-b1097",
  storageBucket: "shoqaq-b1097.appspot.com",
  messagingSenderId: "208023575289",
  appId: "1:208023575289:web:d1f7dca8a35bcd4397e028"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firebaseauth = getAuth(app);
export const firebasedb = getFirestore(app);
export const storage = getStorage(app);