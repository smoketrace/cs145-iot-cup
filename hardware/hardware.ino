// Include essential libraries
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <stdio.h>
#include <time.h>
#include <WiFiManager.h>
#include <FS.h>
#include <SPIFFS.h>
#include <ArduinoJson.h>
#include "EasyBuzzer.h"

// Include definitions

#define SMOKE_INT 5 // Define SMOKE_INT to be the time interval (in seconds) for sending of smoke data
#define BUZZER_PIN 25 // Define BUZZER_PIN to be the pin used for the buzzer
#define SENSOR_PIN 32 // Define SENSOR_PIN to be the pin used for the sensor
#define TRIGGER_PIN 0 // Define TRIGGER_PIN to be the pin used for the WiFiManager

// Certificate needed to access https://hascion-deno-test.deno.dev/sensors API Endpoint
const char* rootCACertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIICGzCCAaGgAwIBAgIQQdKd0XLq7qeAwSxs6S+HUjAKBggqhkjOPQQDAzBPMQsw\n" \
"CQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJuZXQgU2VjdXJpdHkgUmVzZWFyY2gg\n" \
"R3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBYMjAeFw0yMDA5MDQwMDAwMDBaFw00\n" \
"MDA5MTcxNjAwMDBaME8xCzAJBgNVBAYTAlVTMSkwJwYDVQQKEyBJbnRlcm5ldCBT\n" \
"ZWN1cml0eSBSZXNlYXJjaCBHcm91cDEVMBMGA1UEAxMMSVNSRyBSb290IFgyMHYw\n" \
"EAYHKoZIzj0CAQYFK4EEACIDYgAEzZvVn4CDCuwJSvMWSj5cz3es3mcFDR0HttwW\n" \
"+1qLFNvicWDEukWVEYmO6gbf9yoWHKS5xcUy4APgHoIYOIvXRdgKam7mAHf7AlF9\n" \
"ItgKbppbd9/w+kHsOdx1ymgHDB/qo0IwQDAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0T\n" \
"AQH/BAUwAwEB/zAdBgNVHQ4EFgQUfEKWrt5LSDv6kviejM9ti6lyN5UwCgYIKoZI\n" \
"zj0EAwMDaAAwZQIwe3lORlCEwkSHRhtFcP9Ymd70/aTSVaYgLXTWNLxBo1BfASdW\n" \
"tL4ndQavEi51mI38AjEAi/V3bNTIZargCyzuFJ0nN6T5U6VR5CmD1/iQMVtCnwr1\n" \
"/q4AaOeMSQ+2b1tbFfLn\n" \
"-----END CERTIFICATE-----\n";

// Initialize smoke_read for smoke readings
int smoke_read;

// Setup WiFiMulti variable for scanning WiFi access points
WiFiMulti WiFiMulti;

// Setup secure WiFi client
WiFiClientSecure client;

// Setup HTTP client
HTTPClient https;

// Setup WiFi Manager
WiFiManager wm;

// Buffer to contain sensor data to be sent to the server
char buffer[200];

// Boolean to store resetButtonPressed status
bool resetButtonPressed = false;

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

// Run ESP32 configuration
void esp32config(){
  // set configportal timeout
  wm.setConfigPortalTimeout(120);

  if(!wm.autoConnect("Unknown SmokeTrace Device")) {
    Serial.println("Failed to connect or hit timeout");
    ESP.restart();
  } 
  else {
    //if you get here you have connected to the WiFi    
    Serial.println("connected...yeey :)");
  }  
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
  
  EasyBuzzer.setPin(BUZZER_PIN);
  pinMode(TRIGGER_PIN, INPUT_PULLUP);
  pinMode(SENSOR_PIN, INPUT);
  
  // Attach interrupt for ESP32 configuration
  attachInterrupt(digitalPinToInterrupt(TRIGGER_PIN), esp32reset, FALLING);

  Serial.println();
  Serial.println();
  Serial.println();

  WiFi.mode(WIFI_STA);

  // Set certificate for the client
  client.setCACert(rootCACertificate);

  // allow reuse (if server supports it)
  https.setReuse(true);

  // connect ESP32 automatically
  esp32config();
}

void loop() {
  if (resetButtonPressed) {
    // Reset WiFi settings
    wm.resetSettings();
    delay(1000);  // Delay to ensure the reset is completed

    // Restart the device
    ESP.restart();
  }
  if ( WiFi.status() != WL_CONNECTED ) {
    return;
  }
  // Buzzer alarm sequence
  smoke_read = analogRead(SENSOR_PIN);
  EasyBuzzer.update();
  if (smoke_read >= 384) {
    /* Beep at a given frequency for 100 times. */
    EasyBuzzer.beep(1000);
  }
  else {
    /* Stop beeping if smoke_read is low */
    EasyBuzzer.stopBeep();
  }
  Serial.print("[HTTPS] begin...\n");
  if (https.begin(client, "https://smoketrace-api.deno.dev/sensors")) {  // HTTPS
    Serial.print("[HTTPS] POST...\n");
    // payload
    // Calibrate time to nearest 10 seconds
    delay(time_offset());
    sprintf(buffer, "{\"device_id\": \"ESP32_EYRON\", \"smoke_read\": %d, \"time\": %d}", smoke_read, time(nullptr));
    Serial.print(buffer);
    // start connection and send HTTP header
    int httpCode = https.POST(buffer);
    // httpCode will be negative on error
    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTPS] POST... code: %d\n", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
        String payload = https.getString();
        Serial.println(payload);
      }
    } else {
      Serial.printf("[HTTPS] POST... failed, error: %s\n", https.errorToString(httpCode).c_str());
    }

    https.end();
  } else {
    Serial.printf("[HTTPS] Unable to connect\n");
  }
  Serial.println();
  Serial.println("Waiting 10s before the next round...");
}