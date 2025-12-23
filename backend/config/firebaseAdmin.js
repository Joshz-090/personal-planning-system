const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// To use Firebase Admin locally, you usually need a Service Account JSON.
// You can download it from Firebase Console > Project Settings > Service Accounts.
// Then set the path in your .env as GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (serviceAccountPath) {
    try {
        // Option 1: Using path to file
        const serviceAccount = require(`../${serviceAccountPath}`);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
        console.log("Firebase Admin initialized with Service Account");
    } catch (err) {
        console.error("Failed to load Service Account file:", err.message);
        // Fallback
        admin.initializeApp({
            projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
    }
} else {
    admin.initializeApp({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
