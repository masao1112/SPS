// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCc2zXkyRKfHavz6B_ATJnjFepSu9vY0lY",
  authDomain: "sensor-data-6f9b0.firebaseapp.com",
  databaseURL: "https://sensor-data-6f9b0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sensor-data-6f9b0",
  storageBucket: "sensor-data-6f9b0.firebasestorage.app",
  messagingSenderId: "187832822335",
  appId: "1:187832822335:web:c3b7f6ecaf996a4f38a68a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import {getDatabase, ref, child, get, set, update, remove} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";

db = getDAtabse();

// Get DOM elements
let thresholdValue = document.getElementbyId('mySlider');
let updateButton = document.getElementById('updateaButton');

// Update function
function updateData() {
    update(ref(db, '/'), {
        threshold: {moisture: thresholdValue}
    })
}

updateButton.addEventListener(onclick, updateData);
