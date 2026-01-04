import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8o73sRhQlpQ5PzhN6A5vj6g5-g42Afag",
  authDomain: "ev-grid-balancer-8ec62.firebaseapp.com",
  projectId: "ev-grid-balancer-8ec62",
  storageBucket: "ev-grid-balancer-8ec62.firebasestorage.app",
  messagingSenderId: "739631103024",
  appId: "1:739631103024:web:5a28675d69f120b78741f5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
