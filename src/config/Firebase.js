// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Uses environment variables for security (fallback to hardcoded values for development)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB6vdk4n3sKHfxw5UGhr9SinAOy6D5yvBU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "personal-planning-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "personal-planning-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "personal-planning-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "949058242760",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:949058242760:web:2c31e3de85864f21493dfd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RTEJMGK46L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { app, auth, db, analytics };