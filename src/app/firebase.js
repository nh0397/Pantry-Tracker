// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4gHwC-nQQ57G1qUsI-PCtJW9vtndajYU",
  authDomain: "pantrytracker-2486c.firebaseapp.com",
  projectId: "pantrytracker-2486c",
  storageBucket: "pantrytracker-2486c.appspot.com",
  messagingSenderId: "250855305366",
  appId: "1:250855305366:web:1a1b5a07eb5c921c0e52b7",
  measurementId: "G-H1KZY98JH9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;