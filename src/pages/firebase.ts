// firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // 🔥 Tambahkan ini

const firebaseConfig = {
  apiKey: "AIzaSyATQlQswrm7bojQ-4mmT-hNKHkNIAq0HwE",
  authDomain: "desa-medalsari.firebaseapp.com",
  projectId: "desa-medalsari",
  storageBucket: "desa-medalsari.firebasestorage.app",
  messagingSenderId: "368901267804",
  appId: "1:368901267804:web:db30d20250722b06256199",
  measurementId: "G-5HS2K5C8FW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🔐 Inisialisasi dan ekspor Auth
const auth = getAuth(app);
export { auth };
