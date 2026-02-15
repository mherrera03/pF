import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxoFfTy8mq7N51LFwNLzzY4M5SDb5Uwrk",
  authDomain: "pafe-1d5ca.firebaseapp.com",
  projectId: "pafe-1d5ca",
  storageBucket: "pafe-1d5ca.firebasestorage.app",
  messagingSenderId: "494291864728",
  appId: "1:494291864728:web:66301596849ff675af94ed",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;