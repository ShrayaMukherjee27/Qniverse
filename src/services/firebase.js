import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjtoaE_gktlumfTZTW2-eDOgH9KkRzNbw",
  authDomain: "examgraph-83c66.firebaseapp.com",
  projectId: "examgraph-83c66",
  storageBucket: "examgraph-83c66.firebasestorage.app",
  messagingSenderId: "66445159282",
  appId: "1:66445159282:web:af83cf0c33ae901754cbeb",
  measurementId: "G-4JBSLX5JDM"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;