// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBilZVQAcqi7WrZIDHu8vrFbFvRmOEAm5A",
    authDomain: "marnonanew-42de4.firebaseapp.com",
    projectId: "marnonanew-42de4",
    storageBucket: "marnonanew-42de4.firebasestorage.app",
    messagingSenderId: "313500492294",
    appId: "1:313500492294:web:7e00af2d66bb54268c1987",
    measurementId: "G-L78NRMML9T"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Make db available globally
window.db = db;

console.log('✅ Firebase initialized successfully');