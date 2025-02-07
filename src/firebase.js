// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'real-estate-595eb.firebaseapp.com',
  projectId: 'real-estate-595eb',
  storageBucket: 'real-estate-595eb.firebasestorage.app',
  messagingSenderId: '308802846158',
  appId: '1:308802846158:web:51521df464aaad0200ff9f',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
