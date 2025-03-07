// Import the necessary Firebase services
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAja9DAHwm__c0Y91E6157sT0GwZj-maDY",
  authDomain: "slacky-b869a.firebaseapp.com",
  projectId: "slacky-b869a",
  storageBucket: "slacky-b869a.appspot.com",
  messagingSenderId: "764564924101",
  appId: "1:764564924101:web:c4ae2af64e8917053c32ac"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize individual Firebase services
const auth = getAuth(app); // For Authentication
const database = getDatabase(app); // For Realtime Database
const storage = getStorage(app); // For Storage

// Exporting the services
export { app, auth, database, storage };
