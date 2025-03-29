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

import { getDatabase, ref, get, child, set, update, remove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Database deplayment
const db = getDatabase();
// Get DOM elements
let thresholdValue = document.getElementById('mySlider').value;

// Get threshold value when open
get(ref(db, '/threshold/moisture'))
.then(childData => {
    if (childData.exists()){
        thresholdValue = childData.val();
        console.log("Successfully get data: " + thresholdValue)
    }
}).catch(() => {
    console.log(error);
}) 

// Update threshold via user input
function updateData() {
    thresholdValue = document.getElementById('mySlider').value;
    update(ref(db, '/threshold'), {
        moisture: parseInt(thresholdValue)
    }).then(() => {
        alert("Threshold adjusted Succesfully!!")
    }).catch(() => {
        alert('Cannot adjust the threshold.')
        console.log(error);
    })
}    

window.updateData = updateData;

// Fetch data from server side
var pumpStatus = document.querySelector(".pump");
var lightStatus = document.querySelector(".light")

function checkStatus() {
    get(ref(db, '/sensor_data/switch/'))
    .then(childData => {
        if (childData.exists()){
            var fetchedPS = childData.val().pumpStatus;
            var fetchedLS = childData.val().lightStatus;
            console.log("hi")
            if (!fetchedPS) {
                pumpStatus.style.backgroundColor = 'gray';            
            }else {
                pumpStatus.style.backgroundColor = "red";
                pumpStatus.style.transition = "background-color .2s"
            }

            if (!fetchedLS) {
                lightStatus.style.backgroundColor = "gray";
            }else {
                lightStatus.style.backgroundColor = "red";
                lightStatus.style.transition = "background-color .2s"
            }
        }
    }).catch(() => {
        console.error("There's something wrong", Error);
    }) 
}

setInterval(checkStatus, 1000);
    