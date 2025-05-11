// src/lib/firebase/config.ts

// Note: It's generally recommended to keep Firebase server-side config out of client bundles.
// However, for client-side SDK initialization, these need to be available.
// Ensure your build process and environment variables are set up securely.

export const firebaseConfig = {
  apiKey: "AIzaSyDlfEreIchuQPa0en_0VY8xsm61YdrTmFQ",
  authDomain: "device-streaming-b43436c4.firebaseapp.com",
  projectId: "device-streaming-b43436c4",
  storageBucket: "device-streaming-b43436c4.firebasestorage.app", // Corrected from firebasestorage.app to firebaseapp.com if it's a typo, but using user's value. Re-checked, firebasestorage.app seems to be a valid pattern for storage bucket.
  messagingSenderId: "455964792815",
  appId: "1:455964792815:web:369e1ea50f3abfb7de481a",
  measurementId: undefined, // Measurement ID is optional and not provided in the user's snippet.
};

function checkFirebaseConfig(config: typeof firebaseConfig): boolean {
  const configEntries = Object.entries(config) as [keyof typeof config, string | undefined][];
  
  const unsetKeys = configEntries
    .filter(([key, value]) => {
      if (key === 'measurementId') {
        // measurementId is optional. It can be undefined or an empty string.
        // It's problematic only if it's explicitly set to a placeholder value like "YOUR_..."
        return typeof value === 'string' && (value.startsWith("YOUR_") || value.startsWith("G-YOUR"));
      }
      // For all other keys, they must not be falsy (which includes empty string) 
      // and must not be placeholder values.
      return !value || (typeof value === 'string' && value.startsWith("YOUR_"));
    })
    .map(([key]) => key);

  if (unsetKeys.length > 0) {
    console.warn(
      `Firebase configuration is incomplete or uses placeholder values. The following keys are problematic: ${unsetKeys.join(", ")}. If these are hardcoded, please ensure they are correct. The 'measurementId' can be left empty if not used, but should not contain a placeholder.`
    );
    return false;
  }
  return true;
}

export const isFirebaseConfigured = checkFirebaseConfig(firebaseConfig);

// The initializeApp call is handled in src/lib/firebase/client.ts
// import { initializeApp } from "firebase/app";
// const app = initializeApp(firebaseConfig);
