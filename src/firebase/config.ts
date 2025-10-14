// Import validation (will run checks)
import './env-validation';

// Firebase configuration with validation
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Validate required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => key !== 'measurementId' && !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error('Missing Firebase environment variables:', missingVars);
}

export const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || '',
  authDomain: requiredEnvVars.authDomain || '',
  projectId: requiredEnvVars.projectId || '',
  storageBucket: requiredEnvVars.storageBucket || '',
  messagingSenderId: requiredEnvVars.messagingSenderId || '',
  appId: requiredEnvVars.appId || '',
  measurementId: requiredEnvVars.measurementId || '',
};
