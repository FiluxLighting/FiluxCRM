/**
 * Environment variables validation for Vercel deployment
 * This file helps debug Firebase configuration issues
 */

export function validateFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const missing: string[] = [];
  const present: string[] = [];

  Object.entries(config).forEach(([key, value]) => {
    if (value) {
      present.push(key);
    } else if (key !== 'measurementId') { // measurementId is optional
      missing.push(`NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    present,
    config: missing.length === 0 ? config : null
  };
}

// Only log in development or when there are issues
if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
  const validation = validateFirebaseConfig();
  
  if (!validation.isValid) {
    console.error('❌ Missing Firebase environment variables:', validation.missing);
    console.log('✅ Present variables:', validation.present);
    console.log('💡 Make sure to add these variables in your Vercel project settings');
  } else {
    console.log('✅ All Firebase environment variables are configured');
  }
}