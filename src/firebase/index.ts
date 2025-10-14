'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// Initialize Firebase with proper configuration
export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    
    // Validate that we have the necessary configuration
    const hasValidConfig = firebaseConfig.apiKey && 
                          firebaseConfig.authDomain && 
                          firebaseConfig.projectId;
    
    if (!hasValidConfig) {
      throw new Error(
        'Firebase configuration is missing. Please ensure all required environment variables are set: ' +
        'NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID'
      );
    }
    
    try {
      // For Firebase App Hosting, try auto-initialization first
      if (process.env.NODE_ENV === "production" && process.env.FIREBASE_PROJECT_ID) {
        firebaseApp = initializeApp();
      } else {
        throw new Error('Using manual config');
      }
    } catch (e) {
      // Use explicit configuration (normal for most deployments like Vercel)
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
