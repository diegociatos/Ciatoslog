import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Secondary app instance for creating users without affecting current session
export function getSecondaryAuth() {
  const secondaryApp = getApps().find(a => a.name === 'Secondary')
    || initializeApp(firebaseConfig, 'Secondary');
  return getAuth(secondaryApp);
}
