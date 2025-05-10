# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Project Setup

### Environment Variables

This project uses Firebase for authentication and database services. You need to configure your Firebase project credentials.

1.  **Create a Firebase Project**: If you haven't already, create a project on the [Firebase Console](https://console.firebase.google.com/).
2.  **Register your app**: In your Firebase project, add a new Web app.
3.  **Get Firebase config**: After registering your app, Firebase will provide you with a configuration object. You'll need these values.
4.  **Create `.env.local` file**:
    Copy the example environment file `src/.env.local.example` to a new file named `src/.env.local`.
    ```bash
    cp src/.env.local.example src/.env.local
    ```
5.  **Update `.env.local`**:
    Open `src/.env.local` and replace the placeholder values (like `"YOUR_FIREBASE_API_KEY"`) with your actual Firebase project credentials. All required variables start with `NEXT_PUBLIC_`.

    Example of `src/.env.local`:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy...yourApiKey"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="yourSenderId"
    NEXT_PUBLIC_FIREBASE_APP_ID="1:yourAppId:web:yourWebAppId"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-yourMeasurementId" # Optional, for Analytics
    ```

### Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application should now run with Firebase services enabled. If you see messages like "Authentication currently not available" or "Firebase not configured", please double-check your `.env.local` file and ensure all Firebase credentials are correctly set.
