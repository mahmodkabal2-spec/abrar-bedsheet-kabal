import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

// Replace these placeholder values with the config from Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyCHAVsP1wnrCJHqCg4jFXH8Q1xRyQtvGLk",
  authDomain: "abrar-bedsheets.firebaseapp.com",
  projectId: "abrar-bedsheets",
  storageBucket: "abrar-bedsheets.firebasestorage.app",
  messagingSenderId: "882743507269",
  appId: "1:882743507269:web:f73f0b044a05a84119a62c",
  measurementId: "G-W6QFE190KP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const form = document.getElementById('authForm');
const modeButton = document.getElementById('modeButton');
const submitButton = document.getElementById('submitButton');
const authTitle = document.getElementById('authTitle');
const authIntro = document.getElementById('authIntro');
const authMessage = document.getElementById('authMessage');
let isSignUp = false;

function showMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle('is-error', isError);
}

function firebaseMessage(error) {
  const messages = {
    'auth/email-already-in-use': 'That email already has an account. Try signing in.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Use a stronger password with at least 6 characters.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.'
  };
  return messages[error.code] || 'Something went wrong. Please try again.';
}

modeButton.addEventListener('click', () => {
  isSignUp = !isSignUp;
  authTitle.innerHTML = isSignUp ? 'Make room <em>for you.</em>' : 'Welcome <em>back.</em>';
  authIntro.textContent = isSignUp ? 'Create an account to save favorites and keep your bedding orders close.' : 'Sign in to save your favorites and keep your bedding orders close.';
  submitButton.innerHTML = isSignUp ? 'Create account <span>↗</span>' : 'Sign in <span>↗</span>';
  modeButton.textContent = isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account';
  document.getElementById('password').autocomplete = isSignUp ? 'new-password' : 'current-password';
  showMessage('');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  submitButton.disabled = true;
  showMessage(isSignUp ? 'Creating your account...' : 'Signing you in...');

  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
      showMessage('Account created. Welcome to Abrar.');
    } else {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage('Signed in successfully.');
    }
    form.reset();
  } catch (error) {
    showMessage(firebaseMessage(error), true);
  } finally {
    submitButton.disabled = false;
  }
});

