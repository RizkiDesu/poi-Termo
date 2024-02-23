
//LIBRARY
#include <WiFiManager.h>
#include <Arduino.h>
#ifdef ESP32
#include <WiFi.h>
#include <AsyncTCP.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#endif



//HTTP SERVER DI PORT 80
#include <ESPAsyncWebServer.h>
AsyncWebServer server(80);



#include <Wire.h> 
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);




//LIBRARY JSON
#include "AsyncJson.h"
#include "ArduinoJson.h"




//LIBRAY TERMOCOUPLE
#include "max6675.h"

//SENSOR 1
int thermoSO_1 = 16;
int thermoCS_1 = 27;
int thermoSCK_1 = 14;

//SENSOR 2
int thermoSO_2 = 5;
int thermoCS_2 = 13;
int thermoSCK_2 = 12;

//BACA SUHU PADA SENSOR
MAX6675 thermocouple1(thermoSCK_1, thermoCS_1, thermoSO_1);
MAX6675 thermocouple2(thermoSCK_2, thermoCS_2, thermoSO_2);

//FUNGSI READ TEMPERATU SENSOR 1 DAN SENSOR 2
String readTemp1() {
  return String(thermocouple1.readCelsius());
}
String readTemp2() {
  return String(thermocouple2.readCelsius());
}



// JIKA RIQUEST DATA SALAH
void notFound(AsyncWebServerRequest *request)
{
  request->send(404, "application/json", "{\"message\":\"Not found\"}");
}

void setup() {
    WiFi.mode(WIFI_STA); // explicitly set mode, esp defaults to STA+AP
    Serial.begin(115200);

    WiFiManager wm;

    // reset settings - wipe stored credentials for testing
    // these are stored by the esp library
    //wm.resetSettings();

    bool res;
    // res = wm.autoConnect(); // auto generated AP name from chipid
    // res = wm.autoConnect("AutoConnectAP"); // anonymous ap
    res = wm.autoConnect("AutoConnectAP","password"); // password protected ap

    if(!res) {
        Serial.println("Failed to connect");
         ESP.restart();
    } 
    else {
        //if you get here you have connected to the WiFi    
        Serial.println("connected...yeey :)");
        
    }

    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    // initialize the LCD
    lcd.begin();
  
    // Turn on the blacklight and print a message.
    lcd.backlight();
    lcd.setCursor(0,0);
    lcd.print("IP Address: ");
    lcd.setCursor(0,1);
    lcd.print(WiFi.localIP());

    
        
    //HTTP GET
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", "{\"message\":\"Welcome\"}");
    });
    //HTTP GET SENSOR AND GET MESSAGE
    server.on("/get-message", HTTP_GET, [](AsyncWebServerRequest *request) {
      //INISIASI JSON KE DATA
      StaticJsonDocument<100> data;
      //JIKA ADA PESAN DARI APLIKASI
      if (request->hasParam("message"))
      {
        data["message"] = request->getParam("message")->value();
        data["suhu1"] = readTemp1();
        data["suhu2"] = readTemp2();
      }
      //JIKA TIDAK ADA PESAN DARI APLIKASI
      else
      {
        data["message"] = "No message parameter";
        data["suhu1"] = readTemp1();
        data["suhu2"] = readTemp2();
      }
      String response;
      serializeJson(data, response);
      request->send(200, "application/json", response);
    });


    server.onNotFound(notFound);
    server.begin();

}

void loop() {
}
