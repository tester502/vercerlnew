// Import the functions you need from the SDKs you need
import type { FirebaseApp } from "firebase/app";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import type { FirebaseOptions } from "firebase/app";

// Your web app's Firebase configuration - HARDCODED as per user request
// IMPORTANT: For production, it's highly recommended to use environment variables.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDlop1N7JeYUBBxRL0uYF0D2DySPs0mMys",
  authDomain: "autotube-ai.firebaseapp.com",
  projectId: "autotube-ai",
  storageBucket: "autotube-ai.firebasestorage.app", // Reverted to user-provided value
  messagingSenderId: "325873008391",
  appId: "1:325873008391:web:e477713ce45f4e7b3b4fa2"
};

let app: FirebaseApp;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("[DEBUG] Firebase initialized successfully with hardcoded config in src/lib/firebase.ts.");
  } catch (error) {
    console.error("Firebase hardcoded initialization error in src/lib/firebase.ts:", error);
    // If initialization fails even with hardcoded values, there's a deeper issue.
    // This could be due to the values themselves being problematic (e.g., malformed, or project not fully set up for web apps).
    if (error instanceof Error) {
        throw new Error(`Firebase hardcoded initialization failed: ${error.message}`);
    }
    throw new Error("Firebase hardcoded initialization failed with an unknown error.");
  }
} else {
  app = getApp();
  // console.log("[DEBUG] Firebase app already initialized (hardcoded config potentially not re-applied if hot-reloading an old instance).");
}

const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

// It's good practice to explicitly set persistence if needed, though default is usually fine.
// For example, to use session persistence:
// import { browserSessionPersistence, setPersistence } from "firebase/auth";
// setPersistence(auth, browserSessionPersistence)
//   .then(() => {
//     // Existing and future Auth states are now persisted in the current
//     // session only. Closing the window or tab will clear the state.
//   })
//   .catch((error) => {
//     console.error("Firebase Auth persistence error:", error.code, error.message);
//   });

export { app, auth, googleAuthProvider };
