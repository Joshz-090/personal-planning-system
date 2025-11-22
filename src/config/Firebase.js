// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6vdk4n3sKHfxw5UGhr9SinAOy6D5yvBU",
  authDomain: "personal-planning-system.firebaseapp.com",
  projectId: "personal-planning-system",
  storageBucket: "personal-planning-system.firebasestorage.app",
  messagingSenderId: "949058242760",
  appId: "1:949058242760:web:2c31e3de85864f21493dfd",
  measurementId: "G-RTEJMGK46L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { app, auth, db, analytics };