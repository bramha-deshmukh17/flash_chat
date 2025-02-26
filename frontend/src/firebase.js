// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FB_API_KEY,
    authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FB_STORAGE,
    messagingSenderId: import.meta.env.VITE_FB_MESSAGE_SENDERID,
    appId: import.meta.env.VITE_FB_APP_ID
};

// Initialize Firebase (Prevent multiple instances)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Storage
const storage = getStorage(app);

export { storage };
