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
var pumpCheckBox = document.querySelector("#pump-status-check");
var lightCheckBox = document.querySelector("#light-status-check")

function checkPumpStatus() {
    get(ref(db, '/sensor_data/switch/'))
    .then(childData => {
        if (childData.exists()){
            var pumpStatus = childData.val().pumpStatus;
            var lightStatus = childData.val().lightStatus;
            if (lightStatus != lightCheckBox.checked) lightCheckBox.checked = lightStatus;
            if (pumpStatus != pumpCheckBox.checked) pumpCheckBox.checked = pumpStatus; 
            console.log(lightStatus);
        }
    }).catch(() => {
        console.log(error);
    }) 
}

setInterval(checkPumpStatus, 1000);
    