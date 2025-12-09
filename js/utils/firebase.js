// Firebase Configuration and Utility Functions
// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, set, get, update, remove, onValue, child } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyDCJW9t2gXyJpjinqXstPyuuQQE",
    authDomain: "yuken-catalog-app.firebaseapp.com",
    databaseURL: "https://yuken-app-new-07274.firebaseio.com",
    projectId: "yuken-app-new-07274",
    storageBucket: "yuken-catalog-app-new-07274.firebasestorage.app",
    messagingSenderId: "34747584227",
    appId: "1:34747584227:web:b270008cfdedc3ff6fd5"
};

// Initialize Firebase
let app;
let db;

try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Export all Firebase utilities
export {
    app,
    db,
    ref,
    set,
    get,
    update,
    remove,
    onValue,
    child,
    getDatabase
};
