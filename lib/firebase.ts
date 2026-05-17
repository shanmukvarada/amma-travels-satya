import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA88MD7bZWuheNlZByilpk5okqK07HoLbA",
  authDomain: "app-18637.firebaseapp.com",
  projectId: "app-18637",
  storageBucket: "app-18637.firebasestorage.app",
  messagingSenderId: "325318155282",
  appId: "1:325318155282:web:ad6165bbce783c68310ccb",
  measurementId: "G-GP1E1BV0Y2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
