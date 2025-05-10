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
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

function checkFirebaseConfig(config: typeof firebaseConfig): boolean {
  const configEntries = Object.entries(config) as [keyof typeof config, string | undefined][];
  
  const unsetKeys = configEntries
    .filter(([key, value]) => {
      if (key === 'measurementId') {
        // measurementId is optional. It can be undefined or an empty string.
        // It's problematic only if it's explicitly set to a placeholder value.
        return typeof value === 'string' && value.startsWith("YOUR_");
      }
      // For all other keys, they must not be falsy (which includes empty string) 
      // and must not be placeholder values.
      return !value || (typeof value === 'string' && value.startsWith("YOUR_"));
    })
    .map(([key]) => key);

  if (unsetKeys.length > 0) {
    console.warn(
      `Firebase configuration is incomplete or uses placeholder values. The following keys are problematic: ${unsetKeys.join(", ")}. Please ensure your .env.local file has correct Firebase project credentials. The 'measurementId' can be left empty if not used, but should not contain a placeholder like "YOUR_".`
    );
    return false;
  }
  return true;
}

export const isFirebaseConfigured = checkFirebaseConfig(firebaseConfig);

