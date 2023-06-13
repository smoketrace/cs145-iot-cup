// Include essential libraries
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <stdio.h>
#include <time.h>
#include <WiFiManager.h>
#include <Preferences.h>

// Include definitions

#define SMOKE_INT 5 // Define SMOKE_INT to be the time interval (in seconds) for sending of smoke data
#define BUZZER_PIN 25 // Define BUZZER_PIN to be the pin used for the buzzer
#define SENSOR_PIN 32 // Define SENSOR_PIN to be the pin used for the sensor
#define TRIGGER_PIN 0 // Define TRIGGER_PIN to be the pin used for the WiFiManager

// Initialize smoke_read for smoke readings
int smoke_read;

// Setup WiFiMulti variable for scanning WiFi access points
WiFiMulti WiFiMulti;

// Setup secure WiFi client
WiFiClientSecure client;

// Setup HTTP client
HTTPClient http;

// Setup WiFi Manager
WiFiManager wm;

// Buffer to contain sensor data to be sent to the server
char buffer[200];

// Boolean to store resetButtonPressed status
bool resetButtonPressed = false;

// Device_id to store device ID/name
String device_id;

// Flag for saving data
bool shouldSaveConfig = false;

// Preferences to store persistent preferences
Preferences preferences;

// Not sure if WiFiClientSecure checks the validity date of the certificate. 
// Setting clock just to be sure...
void setClock() {
  configTime(28800, 0, "pool.ntp.org");

  Serial.print(F("Waiting for NTP time sync: "));
  time_t nowSecs = time(nullptr);
  int ntp_timeout = 0;
  while (nowSecs < 8 * 3600 * 2) {
    if (++ntp_timeout == 100) { ESP.restart(); }
    delay(500);
    Serial.print(F("."));
    yield();
    nowSecs = time(nullptr);
  }

  Serial.println();
  char * curr_time = ctime(&nowSecs);
  Serial.print(F("Current time: "));
  Serial.print(curr_time);
}

void saveConfigCallback()
// Callback notifying us of the need to save configuration
{
  Serial.println("Should save config");
  shouldSaveConfig = true;
}

// Run ESP32 configuration
void esp32config(){
  // load preferences if exists
  preferences.begin("smoketrace-app", false);

  // obtain preferences if exists
  device_id = preferences.getString("device_id", "");

  // set configportal timeout
  wm.setConfigPortalTimeout(120);
   
  // Set config save notify callback
  wm.setSaveConfigCallback(saveConfigCallback);

  // set device_id field
  WiFiManagerParameter device_id_box("device_id_key", "Set up your device ID", "", 50, "placeholder='Enter your device ID/name here (3-50 chars only)' minlength='3' maxlength='50'");
  wm.addParameter(&device_id_box);

  if(device_id == ""){
    if(!wm.startConfigPortal("Unknown SmokeTrace Device")) {
      Serial.println("Failed to connect or hit timeout");
      ESP.restart();
    } 
    else {
      //if you get here you have connected to the WiFi    
      Serial.println("connected...yeey :)");
    }
  } else {
    if(!wm.autoConnect("Unknown SmokeTrace Device")) {
      Serial.println("Failed to connect or hit timeout");
      ESP.restart();
    } 
    else {
      //if you get here you have connected to the WiFi    
      Serial.println("connected...yeey :)");
    }
  }

  // Save the custom parameters to FS
  if (shouldSaveConfig)
  {
    preferences.putString("device_id", device_id_box.getValue());
    ESP.restart();
  }

  // Check imported values
  Serial.println(device_id);
  Serial.printf("The values in the file are: %s\n", device_id.c_str());

  preferences.end();

  setClock();
}

// Perform immediate ESP32 reset
void IRAM_ATTR esp32reset() {
  resetButtonPressed = true;
}

int time_offset() {
  time_t raw_time = time(nullptr);
  struct tm * curr_time = localtime(&raw_time);
  return (SMOKE_INT - (curr_time->tm_sec % SMOKE_INT))*1000;
}

void setup() {
  // Set up Serial Monitor at 115200 baud
  Serial.begin(115200);
  
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(TRIGGER_PIN, INPUT_PULLUP);
  pinMode(SENSOR_PIN, INPUT);
  
  // Attach interrupt for ESP32 configuration
  attachInterrupt(digitalPinToInterrupt(TRIGGER_PIN), esp32reset, FALLING);

  Serial.println();
  Serial.println();
  Serial.println();

  WiFi.mode(WIFI_STA);

  // Insecure local access
  client.setInsecure();

  // allow reuse (if server supports it)
  http.setReuse(true);

  // connect ESP32 automatically
  esp32config();
}

void loop() {
  if (resetButtonPressed) {
    // Reset WiFi settings
    wm.resetSettings();
    // clear saved preferences
    preferences.clear();
    delay(1000);  // Delay to ensure the reset is completed
    // Restart the device
    ESP.restart();
  }
  if ( WiFi.status() != WL_CONNECTED ) {
    return;
  }
  // Buzzer alarm sequence
  smoke_read = analogRead(SENSOR_PIN);
  if (smoke_read >= 384) {
    digitalWrite(BUZZER_PIN, HIGH);
  }
  else {
    digitalWrite(BUZZER_PIN, LOW);
  }
  Serial.print("[HTTP] begin...\n");
  if (http.begin("http://192.168.1.19:8000/sensors")) {  // HTTP
    Serial.print("[HTTP] POST...\n");
    // payload
    // Calibrate time to nearest 10 seconds
    delay(time_offset());
    sprintf(buffer, "{\"device_id\": \"%s\", \"smoke_read\": %d, \"time\": %d}", device_id.c_str(), smoke_read, time(nullptr));
    Serial.print(buffer);
    // start connection and send HTTP header
    int httpCode = http.POST(buffer);
    // httpCode will be negative on error
    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
        String payload = http.getString();
        Serial.println(payload);
      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    Serial.printf("[HTTP] Unable to connect\n");
  }
  Serial.println();
  Serial.println("Waiting 10s before the next round...");
}