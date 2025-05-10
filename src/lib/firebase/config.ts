// src/lib/firebase/config.ts

// Note: It's generally recommended to keep Firebase server-side config out of client bundles.
// However, for client-side SDK initialization, these need to be available.
// Ensure your build process and environment variables are set up securely.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function checkFirebaseConfig(config: typeof firebaseConfig) {
  const unsetKeys = Object.entries(config)
    .filter(([, value]) => !value || value.startsWith("YOUR_"))
    .map(([key]) => key);

  if (unsetKeys.length > 0) {
    console.warn(
      `Firebase configuration is incomplete. The following keys are not set or are using placeholder values: ${unsetKeys.join(", ")}. Please ensure you have a .env.local file with your Firebase project credentials.`
    );
    return false;
  }
  return true;
}

export const isFirebaseConfigured = checkFirebaseConfig(firebaseConfig);
