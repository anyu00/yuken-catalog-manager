import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyADYPqT2qs_EVWah2KjplnojX5Ypyuu0QE",
    authDomain: "catalog-app-new-a7274.firebaseapp.com",
    databaseURL: "https://catalog-app-new-a7274-default-rtdb.firebaseio.com",
    projectId: "catalog-app-new-a7274",
    storageBucket: "catalog-app-new-a7274.firebasestorage.app",
    messagingSenderId: "34747584227",
    appId: "1:34747584227:web:af270008cf3fedc318ffd6",
    measurementId: "G-M3KBC1NEZM"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, update, remove, onValue };
