// Include essential libraries
#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <stdio.h>
#include <time.h>
#include "EasyBuzzer.h"

// Include definitions

// Define SMOKE_INT to be the time interval (in seconds) for sending of smoke data
#define SMOKE_INT 5

// Define BUZZER_PIN to be the pin used for the buzzer
#define BUZZER_PIN 18

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
int smoke_read = 0;

// Setup WiFiMulti variable for scanning WiFi access points
WiFiMulti WiFiMulti;

// Setup secure WiFi client
WiFiClientSecure client;

// Setup HTTP client
HTTPClient https;

// Buffer to contain sensor data to be sent to the server
char buffer[200];

// Define curr_time as printable current time
char * curr_time;

// Not sure if WiFiClientSecure checks the validity date of the certificate. 
// Setting clock just to be sure...
void setClock() {
  configTime(28800, 0, "pool.ntp.org");

  Serial.print(F("Waiting for NTP time sync: "));
  time_t nowSecs = time(nullptr);
  while (nowSecs < 8 * 3600 * 2) {
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

char * getTime() {
  time_t raw_time = time(nullptr);
  char * ret_time = ctime(&raw_time);
  ret_time[strlen(ret_time)-1] = '\0';
  return ret_time;
}

int time_offset() {
  time_t raw_time = time(nullptr);
  struct tm * curr_time = localtime(&raw_time);
  return (SMOKE_INT - (curr_time->tm_sec % SMOKE_INT))*1000;
}

void setup() {
  // Set up Serial Monitor at 115200 baud
  Serial.begin(115200);
  // Serial.setDebugOutput(true);

  Serial.println();
  Serial.println();
  Serial.println();

  WiFi.mode(WIFI_STA);
  // WiFiMulti.addAP("Proposal", "approved");
  // WiFiMulti.addAP("4studentstoo", "W1F14students");
  WiFiMulti.addAP("Redmi Note 9", "12343210");
  WiFiMulti.addAP("Matimtiman_Residences", "OurHouse60Mat");

  // wait for WiFi connection
  Serial.print("Waiting for WiFi to connect...");
  while ((WiFiMulti.run() != WL_CONNECTED)) {
    Serial.print(".");
  }
  Serial.println(" connected");

  // Set certificate for the client
  client.setCACert(rootCACertificate);

  // allow reuse (if server supports it)
  https.setReuse(true);

  setClock(); 

  EasyBuzzer.setPin(BUZZER_PIN);
  
}

void loop() {
  // Buzzer alarm sequence
  EasyBuzzer.update();
  EasyBuzzer.stopBeep();
  if (smoke_read >= 0 && smoke_read <= 2) {
    /* Beep at a given frequency for 100 times. */
    EasyBuzzer.beep(1000);
  }
  Serial.print("[HTTPS] begin...\n");
  if (https.begin(client, "https://smoketrace-api.deno.dev/sensors")) {  // HTTPS
    Serial.print("[HTTPS] POST...\n");
    // payload
    // Calibrate time to nearest 10 seconds
    delay(time_offset());
    curr_time = getTime();
    sprintf(buffer, "{\"device_id\": \"ESP32_EYRON\", \"smoke_read\": %d, \"time\": \"%s\"}", smoke_read, curr_time);
    Serial.print(buffer);
    // start connection and send HTTP header
    int httpCode = https.POST(buffer);
    smoke_read++; // temporary smoke_read for debugs
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