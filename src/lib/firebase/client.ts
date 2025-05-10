// src/lib/firebase/client.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (isFirebaseConfigured) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Provide dummy/mock objects if Firebase is not configured
  // This allows the app to run without Firebase for local development or if Firebase is optional
  console.warn("Firebase is not configured. App will run with mock Firebase services.");

  // @ts-ignore - Mocking Firebase App
  app = { name: 'mock-app', options: {}, automaticDataCollectionEnabled: false };
  
  // @ts-ignore - Mocking Firebase Auth
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
    createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase not configured")),
    signOut: () => Promise.reject(new Error("Firebase not configured")),
    // Add other methods as needed by your app, returning errors or dummy data
  } as Auth;

  // @ts-ignore - Mocking Firestore
  db = {
    // Mock methods as needed
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        set: () => Promise.reject(new Error("Firebase not configured")),
        update: () => Promise.reject(new Error("Firebase not configured")),
        delete: () => Promise.reject(new Error("Firebase not configured")),
        onSnapshot: () => () => {},
      }),
      add: () => Promise.reject(new Error("Firebase not configured")),
      where: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        onSnapshot: () => () => {},
      }),
       orderBy: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        onSnapshot: () => () => {},
      }),
      limit: () => ({
        get: () => Promise.reject(new Error("Firebase not configured")),
        onSnapshot: () => () => {},
      }),
      get: () => Promise.reject(new Error("Firebase not configured")),
    }),
  } as Firestore;
}


export { app, auth, db, isFirebaseConfigured };
