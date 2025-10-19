/**
 * Firebase Configuration
 * Initialize Firebase app and export auth instance
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Validate Firebase configuration
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing or placeholder values
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value || value.includes('your-') || value.includes('-here'))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Firebase Configuration Error:');
  console.error('Missing or invalid environment variables:', missingVars.join(', '));
  console.error('\n📝 To fix this:');
  console.error('1. Go to https://console.firebase.google.com/');
  console.error('2. Select your project');
  console.error('3. Go to Project Settings → Your apps → Web app');
  console.error('4. Copy the config values to admin-client/.env.local\n');
  
  throw new Error(
    `Firebase configuration is incomplete. Please update .env.local with your Firebase credentials. Missing: ${missingVars.join(', ')}`
  );
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId,
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;

