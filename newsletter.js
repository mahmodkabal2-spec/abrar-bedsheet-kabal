import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { addDoc, collection, getFirestore, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCHAVsP1wnrCJHqCg4jFXH8Q1xRyQtvGLk",
  authDomain: "abrar-bedsheets.firebaseapp.com",
  projectId: "abrar-bedsheets",
  storageBucket: "abrar-bedsheets.firebasestorage.app",
  messagingSenderId: "882743507269",
  appId: "1:882743507269:web:f73f0b044a05a84119a62c",
  measurementId: "G-W6QFE190KP"
};

const db = getFirestore(initializeApp(firebaseConfig));
const form = document.getElementById('newsletterForm');
const emailInput = document.getElementById('emailInput');
const message = document.getElementById('newsletterMessage');
const button = form.querySelector('button');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!emailInput.value.trim() || !emailInput.validity.valid) {
    message.textContent = 'Please enter a valid email address.';
    emailInput.focus();
    return;
  }

  button.disabled = true;
  message.textContent = 'Joining the list...';
  try {
    await addDoc(collection(db, 'newsletterSubscribers'), {
      email: emailInput.value.trim().toLowerCase(),
      subscribedAt: serverTimestamp()
    });
    message.textContent = 'You are on the list. Welcome to softer mornings.';
    form.reset();
  } catch (error) {
    message.textContent = 'We could not save your email. Please try again.';
    console.error('Newsletter subscription failed:', error);
  } finally {
    button.disabled = false;
  }
});