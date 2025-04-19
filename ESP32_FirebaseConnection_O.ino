#include <Firebase_ESP_Client.h>
#include <WiFi.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <DHTesp.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <IRremote.h>

// Button on action
#define PREV 0xBB44FF00 // -light
#define NEXT 0xBF40FF00 // +light
#define M 0xF807FF00 // -moisture
#define P 0xEA15FF00 // +moisture

// OLED display width and height
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

// IR pin
const int IR_RECEIVE_PIN = 15;

// OLED I2C address (usually 0x3C)
#define OLED_ADDR 0x3C

// Create display object
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// Initialize DHT sensor
DHTesp dht;


#define ssid "?"
#define passwd "88888888"
#define API_KEY "AIzaSyCc2zXkyRKfHavz6B_ATJnjFepSu9vY0lY"
#define DATABASE_URL "https://sensor-data-6f9b0-default-rtdb.asia-southeast1.firebasedatabase.app/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signUp = false;
#define DHT_PIN 17
#define SOIL_SENSOR_PIN 36   // Cảm biến độ ẩm đất (Analog)
#define LIGHT_SENSOR_PIN 34  // Cảm biến ánh sáng (Analog)
#define RELAY_PUMP_PIN 03    // Relay điều khiển bơm nước
#define RELAY_LIGHT_PIN 01   // Relay điều khiển đèn LED

// Threshold for pump switch (0 - 1023)
int soilThreshold;
// Threshold for light switch (0 - 1023)
int lightThreshold;
// Light status
bool lightStatus;
// Pump Status
bool pumpStatus;
// Temp
float temp;
// Humid
float hum;
// Soil moisture
int soilMoisture;
// Light Value
int lightValue;

// Draw Block to display function
void drawBar(int x, int y, int value) {
  int blocks = value / 10;
  for (int i = 0; i < 10; i++) {
    if (i < blocks)
      display.fillRect(x + i * 6, y, 5, 10, SSD1306_WHITE);  // filled
    else
      display.drawRect(x + i * 6, y, 5, 10, SSD1306_WHITE);  // outline
  }
}
// Display function
void displayData() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Line 1: Temperature and Humidity
  display.setCursor(0, 0);
  display.printf("T: %.1fC   H: %.1f%%", temp, hum);

  // Line 2: Soil and Light
  display.setCursor(0, 10);
  display.printf("M: %d%%      L: %d%%", soilMoisture, lightValue);

  // Line 3: Moisture Threshold
  display.setCursor(0, 22);
  display.print("Moist Thresh:");
  drawBar(0, 32, soilThreshold);
  display.setCursor(70, 34);
  display.printf("(%d)", soilThreshold);

  // Line 4: Light Threshold
  display.setCursor(0, 43);
  display.print("Light Thresh:");
  drawBar(0, 52, lightThreshold);
  display.setCursor(70, 54);
  display.printf("(%d)", lightThreshold);

  display.display();
}


void setup() {
  delay(500);
  Serial.begin(921600);
  WiFi.begin(ssid, passwd);
  Serial.print("Connecting to Wifi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(300);
  }
  Serial.println();

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Successfully signed in.");
    signUp = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  // IR remote initialize
  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK); // Start the receiver

  // Initialize OLED display
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("SSD1306 allocation failed"));
    while (true); // Halt
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);

  // Set up pinMode
  dht.setup(DHT_PIN, DHTesp::DHT11);
  pinMode(DHT_PIN, INPUT_PULLUP);
  pinMode(RELAY_LIGHT_PIN, OUTPUT);
  pinMode(RELAY_PUMP_PIN, OUTPUT);
  pinMode(LIGHT_SENSOR_PIN, INPUT);
  pinMode(SOIL_SENSOR_PIN, INPUT);
}

void loop() {
  if (Firebase.ready() && signUp && millis() - sendDataPrevMillis > 3000 || sendDataPrevMillis == 0) {
    sendDataPrevMillis = millis();

    //---------"STORE the data in realtime"
    /*
    *Temperature and humidity value
    */
    TempAndHumidity data = dht.getTempAndHumidity();
    temp = data.temperature;
    hum = data.humidity;

    /*
    *Soil Moisture Value
    */
    soilMoisture = analogRead(SOIL_SENSOR_PIN);
    //Prepare the value for further ops
    soilMoisture = map(soilMoisture, 0, 4095, 0, 100);
    soilMoisture = 100 - soilMoisture;
    /*
    *Light intensity Value
    */
    lightValue = analogRead(LIGHT_SENSOR_PIN);
    //Prepare the value for further ops
    lightValue = map(lightValue, 0, 4095, 0, 100);
    lightValue = 100 - lightValue;
    // Check for Validation
    if (isnan(temp) || isnan(hum) || isnan(soilMoisture) || isnan(lightValue)) {
      Serial.println("Sensor read failed!");
    } else {
      //---------"SEND the data in realtime"
      if (Firebase.RTDB.setFloat(&fbdo, "sensor_data/number/temp", temp)) {
        Serial.printf("Temp: %.1f°C ", temp);
        Serial.print("--Successfully saved to " + fbdo.dataPath());
        Serial.println('(' + fbdo.dataType() + ")");
      } else {
        Serial.println("FAILED: " + fbdo.errorReason());
      }

      if (Firebase.RTDB.setFloat(&fbdo, "sensor_data/number/hum", hum)) {
        Serial.printf("Humidity: %.1f%%", hum);
        Serial.print("--Successfully saved to " + fbdo.dataPath());
        Serial.println('(' + fbdo.dataType() + ")");
      } else {
        Serial.println("FAILED: " + fbdo.errorReason());
      }

      if (Firebase.RTDB.setInt(&fbdo, "sensor_data/number/lightIntensity", lightValue)) {
        Serial.printf("Light Intensity: %i", lightValue);
        Serial.print("--Successfully saved to " + fbdo.dataPath());
        Serial.println('(' + fbdo.dataType() + ")");
      } else {
        Serial.println("FAILED: " + fbdo.errorReason());
      }

      if (Firebase.RTDB.setInt(&fbdo, "sensor_data/number/soilMoisture", soilMoisture)) {
        Serial.printf("Soil Moisture: %i", soilMoisture);
        Serial.print("--Successfully saved to " + fbdo.dataPath());
        Serial.println('(' + fbdo.dataType() + ")");
      } else {
        Serial.println("FAILED: " + fbdo.errorReason());
      }

      //---------"FETCH the data in realtime"
      /*
      * Read from /threshold/moisture -> Soil moisture 
      */
      if (Firebase.RTDB.getInt(&fbdo, "threshold/moisture")) {
        if (fbdo.dataType() == "int") {
          soilThreshold = fbdo.intData();
          Serial.println("Successful reading from " + fbdo.dataPath() + ": " + soilThreshold + " (" + fbdo.dataType() + ')');
          if (soilMoisture < soilThreshold) {
            //Prevent race condition from pulling too much current
            if(lightStatus == true) {
              lightStatus = false;
              Firebase.RTDB.setBool(&fbdo, "sensor_data/switch/lightStatus", lightStatus);
              digitalWrite(RELAY_LIGHT_PIN, LOW);  // Pump ON
            }
            digitalWrite(RELAY_PUMP_PIN, HIGH);  // Pump ON
            pumpStatus = true;
            Serial.println("Pump ON");
            //---Override switch data
            if (Firebase.RTDB.setBool(&fbdo, "sensor_data/switch/pumpStatus", pumpStatus)) {
              Serial.printf("Sucessfully Update Pump Status to True!!");
            }
          } else {
            digitalWrite(RELAY_PUMP_PIN, LOW);  // Pump OFF
            pumpStatus = false;
            Serial.println("Pump OFF");
            //---Override switch data
            if (Firebase.RTDB.setBool(&fbdo, "sensor_data/switch/pumpStatus", pumpStatus)) {
              Serial.printf("Sucessfully Update Pump Status to False!!");
            }
          }
        }
      } else {
        Serial.println("FAILED: " + fbdo.errorReason());
      }
      /*
      * Read from /threshold/intensity -> Light intensity
      */
      if (Firebase.RTDB.getInt(&fbdo, "threshold/intensity")) {
        if (fbdo.dataType() == "int") {
          lightThreshold = fbdo.intData();
          Serial.printf("Light threshold: %d\n", lightThreshold);
          Serial.println("Successful reading from " + fbdo.dataPath() + ": " + lightThreshold + " (" + fbdo.dataType() + ')');
          if (lightValue < lightThreshold) {
            //Prevent race condition from pulling too much current
            if (pumpStatus == false) {
              digitalWrite(RELAY_LIGHT_PIN, HIGH);  // Light OFF
              lightStatus = true;
              Serial.println("Light ON");
              //---Override switch data
              if (Firebase.RTDB.setBool(&fbdo, "sensor_data/switch/lightStatus", lightStatus)) {
                Serial.printf("Sucessfully Update Light Status to True!!");
              }
            }
          } else {
            digitalWrite(RELAY_LIGHT_PIN, LOW);  // Light ON
            lightStatus = false;
            Serial.println("Light OFF");
            //---Override switch data
            if (Firebase.RTDB.setBool(&fbdo, "sensor_data/switch/lightStatus", lightStatus)) {
              Serial.printf("Sucessfully Update Light Status to False!!");
            }
          }
        }
      } else {
        Serial.println("FAILED: " + fbdo.errorReason());
      }

      // Display the Data
      displayData();
    }
  }

  // IR decoder
  /*
    1. decode user input button
    2. adjust treshold value
    3. send to firebase
    4. display on screen*/
  if (IrReceiver.decode()) {
    Serial.println(IrReceiver.decodedIRData.decodedRawData, HEX);
    switch (IrReceiver.decodedIRData.decodedRawData) {
      case PREV:
      if (lightThreshold <= 100 && lightThreshold >= 10){
        if (lightThreshold%10 == 0) {
          lightThreshold -= 10;
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/intensity", lightThreshold)) {
            Serial.printf("Succesfully update Light threshold to %d\n", lightThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }else {
          lightThreshold -= (lightThreshold%10);
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/intensity", lightThreshold)) {
            Serial.printf("Succesfully update Light threshold to %d\n", lightThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }
        Serial.printf("Light Threshold: %d\n", lightThreshold);
        displayData();
      }
      break;
      case NEXT:
      if (lightThreshold <= 90 && lightThreshold >= 0){
        if (lightThreshold%10 == 0) {
          lightThreshold += 10;
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/intensity", lightThreshold)) {
            Serial.printf("Succesfully update Light threshold to %d\n", lightThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }else {
          lightThreshold += (10-lightThreshold%10);
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/intensity", lightThreshold)) {
            Serial.printf("Succesfully update Light threshold to %d\n", lightThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }
        displayData();
      }
      break;
      case M:
      if (soilThreshold <= 100 && soilThreshold >= 10){
        if (soilThreshold%10 == 0) {
          soilThreshold -= 10;
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/moisture", soilThreshold)) {
            Serial.printf("Succesfully update Soil threshold to %d\n", soilThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }else {
          soilThreshold -= (soilThreshold%10);
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/moisture", soilThreshold)) {
            Serial.printf("Succesfully update Soil threshold to %d\n", soilThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }
        displayData();
      }
      break;
      case P:
      if (soilThreshold <= 90 && soilThreshold >= 0){
        if (soilThreshold%10 == 0) {
          soilThreshold += 10;
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/moisture", soilThreshold)) {
            Serial.printf("Succesfully update Soil threshold to %d\n", soilThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }else {
          soilThreshold += (10-soilThreshold%10);
          // Send to FB
          if (Firebase.RTDB.setInt(&fbdo, "threshold/moisture", soilThreshold)) {
            Serial.printf("Succesfully update Soil threshold to %d\n", soilThreshold);
          } else {
            Serial.println("FAILED: " + fbdo.errorReason());
          }
        }
        displayData();
      }
      break;
    }
    IrReceiver.resume(); // Enable receiving of the next value
  }
}