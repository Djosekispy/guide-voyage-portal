// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBsQ3339Z_UadiOsKsPGdOp0LHEuMqsOEU",
  authDomain: "kilemba-df33a.firebaseapp.com",
  projectId: "kilemba-df33a",
  storageBucket: "kilemba-df33a.appspot.com",
  messagingSenderId: "877784344083",
  appId: "1:877784344083:web:da5492792babbf52f3c1e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;