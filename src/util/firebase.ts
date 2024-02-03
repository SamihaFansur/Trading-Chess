import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyCUyPgR8Z7fj3iXS_VXlsZOUurasOnochI",
    authDomain: "react-chess-d36fb.firebaseapp.com",
    databaseURL: "https://react-chess-d36fb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "react-chess-d36fb",
    storageBucket: "react-chess-d36fb.appspot.com",
    messagingSenderId: "179911716640",
    appId: "1:179911716640:web:288ee42b166e3069207145"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getDatabase(app);

signInAnonymously(auth)
    .catch(error => console.error(error));