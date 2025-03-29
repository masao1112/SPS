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

// Database deployment
const db = getDatabase();

//Fetch Data from Firebase
function fetchRealtimeData() {
  get(ref(db, '/sensor_data/number'))
  .then(childData => {
      if (childData.exists()){
          var tempValue = childData.val().temp;
          var humValue = childData.val().hum;
          var moistureValue = childData.val().soilMoisture;
          var lightValue = childData.val().lightIntensity;
          console.log(`Successfully get data: Temp=${tempValue}`);
          var data = [
          {
            type: "indicator",
            value: tempValue,
            number: { suffix: '&#176;C', 'font.family': 30 },
            delta: { reference: 30 },
            gauge: { axis: { visible: false, range: [0, 50] } },
            title: { text: 'Temperature'},
            domain: { row: 0, con: 0 }
          },
          {
            type: "indicator",
            value: humValue,
            delta: { reference: 1024 },
            gauge: { axis: { visible: false, range: [0, 1024] } },
            title: { text: 'Humid'},
            domain: { row: 0, column: 1 },
          },
          {
            type: "indicator",
            mode: "number+delta",
            value: lightValue,
            title: { text: 'Light Intensity' },
            domain: { row: 1, column: 0 }
          },
          {
            type: "indicator",
            mode: "number+delta",
            value: moistureValue,
            title: {text:'Soil Moisture'},
            domain: { row: 1, column: 1 }
          }
        ];

        var layout = {
          width: 1000,
          height: 400,
          margin: { t: 25, b: 25, l: 25, r: 25 },
          grid: { rows: 2, columns: 2, pattern: "independent" },
          template: {
            data: {
              indicator: [
                {
                  mode: "number+delta+gauge",
                }
              ]
            }
          }
        };
        
        
        Plotly.newPlot('myGauge', data, layout);
      }
  }).catch(() => {
      console.log(error);
  }) 
}

setInterval(fetchRealtimeData, 2000)
