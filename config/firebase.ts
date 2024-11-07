import { initializeApp } from "firebase/app";
import {
  collection,
  query,
  where,
  onSnapshot,
  getFirestore,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBU3uNymkFyLSCNPZkMRmh3N3bPSO3BXRs",
  authDomain: "rider-app-fde41.firebaseapp.com",
  projectId: "rider-app-fde41",
  storageBucket: "rider-app-fde41.appspot.com",
  messagingSenderId: "337749060132",
  appId: "1:337749060132:web:8eca556c2d58abb5b5c6b1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const addDataToDb = (ride: any) => {
  return addDoc(collection(db, "Ride"), ride);
};

export { query, where, onSnapshot, doc, updateDoc, db, collection };
