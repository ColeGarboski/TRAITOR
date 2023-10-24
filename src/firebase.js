// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyB_yxf1HbCKAb6TEiIWEnXLvg_uvZ3S9NE",

  authDomain: "traitor-14f52.firebaseapp.com",

  projectId: "traitor-14f52",

  storageBucket: "traitor-14f52.appspot.com",

  messagingSenderId: "97577667106",

  appId: "1:97577667106:web:9bc57dabe841c3a6af987b"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };