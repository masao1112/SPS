// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  databaseURL: "DB_URL",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE_BUCKET",
  messagingSenderId: "MESSAGE_ID",
  appId: "APP_ID"
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
            delta: { reference: 50 },
            gauge: { axis: { visible: false, range: [0, 50] } },
            title: { text: 'Temperature'},
            domain: { row: 0, con: 0 }
          },
          {
            type: "indicator",
            value: humValue,
            delta: { reference: 100 },
            gauge: { axis: { visible: false, range: [0, 100] } },
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
