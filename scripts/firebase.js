// scripts/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase konfigürasyonunuz
const firebaseConfig = {
  apiKey: "AIzaSyDWNKXfLPcxEzOMiFZpcFAJJ_4WPo4YHNs",
  authDomain: "eklft-brick-game.firebaseapp.com",
  projectId: "eklft-brick-game",
  storageBucket: "eklft-brick-game.firebasestorage.app",
  messagingSenderId: "600145370635",
  appId: "1:600145370635:web:a22d7e06b599ad6ee2310e",
  measurementId: "G-MD4B8R5ZWW",
};

// Firebase başlatma
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Skor kaydetme fonksiyonu
export async function saveScore({ name, score, duration, level }) {
  try {
    await addDoc(collection(db, "scoreboard"), {
      name,
      score,
      duration,
      level,
      time: serverTimestamp(), // Oynamanın bittiği zamanı otomatik ekler
    });
    console.log("Skor başarıyla kaydedildi.");
  } catch (error) {
    console.error("Skor kaydetme hatası:", error);
  }
}

// Skorları çekme fonksiyonu (skor bazında azalan sıralama)
export async function getScores() {
  const q = query(collection(db, "scoreboard"), orderBy("score", "desc"));
  const querySnapshot = await getDocs(q);
  const scores = [];
  querySnapshot.forEach((doc) => {
    scores.push({ id: doc.id, ...doc.data() });
  });
  return scores;
}
