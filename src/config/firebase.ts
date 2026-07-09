import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC75sM6GwNBz3KBgLlDGs8IzemfQCGfou0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartfin-app-23f24.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartfin-app-23f24",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartfin-app-23f24.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "435608388531",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:435608388531:web:fa75504c59d882b18701c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
