import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const env = import.meta.env;

// Web config is not secret (access is enforced by firestore.rules). Values from the old project are the default.
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAblvXEVKj3FIBpRflp1QkEyK8lGBfFggY',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'visit-nature-85ca3.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'visit-nature-85ca3',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'visit-nature-85ca3.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '566073101270',
  appId: env.VITE_FIREBASE_APP_ID || '1:566073101270:web:1f32aea63be94281973277',
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Offline-capable Firestore: reads keep working without a connection (part of the PWA story)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
