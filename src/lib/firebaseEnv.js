/**
 * Firebase environment layer — deliberately free of any Firebase SDK import.
 *
 * The public website only needs to know *whether* Firebase is configured. If
 * that flag lived in firebase.js (which imports the SDK), every visitor would
 * download and parse the SDK during first paint. This module stays tiny and
 * SDK-free; firebase.js owns all SDK work.
 */

const env = import.meta.env

/**
 * The web config below comes from Vite environment variables (.env.local).
 * This is *client configuration*, not a credential: knowing it does not grant
 * access to any data. Everything that matters is enforced by Firebase
 * Authentication and by Firestore Security Rules.
 */
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

/** True when enough configuration is present to talk to Firebase. */
export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)
