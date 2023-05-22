/**
   BasicHTTPSClient.ino

    Created on: 14.10.2018

*/

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiMulti.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// This is GandiStandardSSLCA2.pem, the root Certificate Authority that signed 
// the server certifcate for the demo server https://jigsaw.w3.org in this
// example. This certificate is valid until Sep 11 23:59:59 2024 GMT
const char* rootCACertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIDujCCAz+gAwIBAgISA/KkX7iYVRHeJTcR/FGk+CrjMAoGCCqGSM49BAMDMDIx\n" \
"CzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQswCQYDVQQDEwJF\n" \
"MTAeFw0yMzA1MTQyMzUzNTVaFw0yMzA4MTIyMzUzNTRaMBUxEzARBgNVBAMMCiou\n" \
"ZGVuby5kZXYwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARC6wKg+lt+Jjho3sjc\n" \
"psYhABfjt1fbvogyssC4ZtpLSS/rPCeziZ4UCg++3Qk91WTig6P0mZ5GQO0Z/Ukd\n" \
"2sz+o4ICUDCCAkwwDgYDVR0PAQH/BAQDAgeAMB0GA1UdJQQWMBQGCCsGAQUFBwMB\n" \
"BggrBgEFBQcDAjAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBTK0fD8N9T+50p4TCyy\n" \
"RZav4OuWOzAfBgNVHSMEGDAWgBRa8+0r/DbCN3m5UjDqVG/PVcsurDBVBggrBgEF\n" \
"BQcBAQRJMEcwIQYIKwYBBQUHMAGGFWh0dHA6Ly9lMS5vLmxlbmNyLm9yZzAiBggr\n" \
"BgEFBQcwAoYWaHR0cDovL2UxLmkubGVuY3Iub3JnLzAfBgNVHREEGDAWggoqLmRl\n" \
"bm8uZGV2gghkZW5vLmRldjBMBgNVHSAERTBDMAgGBmeBDAECATA3BgsrBgEEAYLf\n" \
"EwEBATAoMCYGCCsGAQUFBwIBFhpodHRwOi8vY3BzLmxldHNlbmNyeXB0Lm9yZzCC\n" \
"AQUGCisGAQQB1nkCBAIEgfYEgfMA8QB3ALc++yTfnE26dfI5xbpY9Gxd/ELPep81\n" \
"xJ4dCYEl7bSZAAABiBzmT2UAAAQDAEgwRgIhAL2jFLfGJaTXY4cjSsS0W3L4UZOf\n" \
"7N346Q6ved3Hy/9LAiEA0J/y+r6fnudT6s7sVFH/SBtcSN22oWTjk4F6+Io0tUMA\n" \
"dgDoPtDaPvUGNTLnVyi8iWvJA9PL0RFr7Otp4Xd9bQa9bgAAAYgc5k9GAAAEAwBH\n" \
"MEUCIQC56pCyb+exjNTyQXP5wy258v0yY89lqDzKd3RW1QRFQQIgOYVlkgIXR/Lw\n" \
"Z/AlnW/PPdJA91ucw3PyiDjUk0M9Ae8wCgYIKoZIzj0EAwMDaQAwZgIxANMH2Eiy\n" \
"OEZIvXFFgoGMQUkcv/Om8uh0qjxPpJk/b6fCCn/5acFPxPqflzsQamdwcAIxAMcK\n" \
"iST3jdRsAk9XAq38WzTIA8oY/XZ5PrkJm8ncf8EnNFAnbdSP8GTVRuebLCzKNw==\n" \
"-----END CERTIFICATE-----\n";


// Not sure if WiFiClientSecure checks the validity date of the certificate. 
// Setting clock just to be sure...
void setClock() {
  configTime(0, 0, "pool.ntp.org");

  Serial.print(F("Waiting for NTP time sync: "));
  time_t nowSecs = time(nullptr);
  while (nowSecs < 8 * 3600 * 2) {
    delay(500);
    Serial.print(F("."));
    yield();
    nowSecs = time(nullptr);
  }

  Serial.println();
  struct tm timeinfo;
  gmtime_r(&nowSecs, &timeinfo);
  Serial.print(F("Current time: "));
  Serial.print(asctime(&timeinfo));
}


WiFiMulti WiFiMulti;

void setup() {

  Serial.begin(115200);
  // Serial.setDebugOutput(true);

  Serial.println();
  Serial.println();
  Serial.println();

  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP("PatayKangTabaKa", "jellyiotbackend");

  // wait for WiFi connection
  Serial.print("Waiting for WiFi to connect...");
  while ((WiFiMulti.run() != WL_CONNECTED)) {
    Serial.print(".");
  }
  Serial.println(" connected");

  setClock();  
}

void loop() {
  WiFiClientSecure *client = new WiFiClientSecure;
  if(client) {
    client -> setCACert(rootCACertificate);

    {
      // Add a scoping block for HTTPClient https to make sure it is destroyed before WiFiClientSecure *client is 
      HTTPClient https;
  
      Serial.print("[HTTPS] begin...\n");
      //if (https.begin(*client, "https://hascion-deno-test.deno.dev/")) {  // HTTPS
      if (https.begin(*client, "https://hascion-deno-test.deno.dev/sensors/ESP32_JUDE")) {  // HTTPS
        Serial.print("[HTTPS] GET...\n");
        // start connection and send HTTP header
        int httpCode = https.GET();
  
        // httpCode will be negative on error
        if (httpCode > 0) {
          // HTTP header has been send and Server response header has been handled
          Serial.printf("[HTTPS] GET... code: %d\n", httpCode);
  
          // file found at server
          if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_MOVED_PERMANENTLY) {
            String payload = https.getString();
            Serial.println(payload);
          }
        } else {
          Serial.printf("[HTTPS] GET... failed, error: %s\n", https.errorToString(httpCode).c_str());
        }
  
        https.end();
      } else {
        Serial.printf("[HTTPS] Unable to connect\n");
      }

      // End extra scoping block
    }
  
    delete client;
  } else {
    Serial.println("Unable to create client");
  }

  Serial.println();
  Serial.println("Waiting 10s before the next round...");
  delay(10000);
}
