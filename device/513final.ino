// This #include statement was automatically added by the Particle IDE.
#include "activity.h"

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_VEML6070.h>

// This #include statement was automatically added by the Particle IDE.
#include <AssetTracker.h>

#include <vector>
#include <stdlib.h>

using namespace std;

#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)

Adafruit_VEML6070 UVTracker = Adafruit_VEML6070();
AssetTracker locationTracker = AssetTracker();

int button = A1;
int led = D7;

float thresUV = 50.0;

vector<String> recorded = vector<String>();
Activity curr;
int alternat = 0;
int trys = 0;
int tSpeed = 0;
unsigned long lastSync = millis();
bool executeStateMachines = false;
String APIKEY = String();
unsigned long duration = 0;
enum State {S_stop, S_record, S_pause};
String ID;

State state;

float randomSpeed = 0.0;
float UVred =0.0;

void rando(){
    srand (Time.now());
    
    randomSpeed = randomSpeed + ((rand() % 500)/100.0) - 2.0;
    if(randomSpeed < 0.0){
        randomSpeed = 0.0;
    }
    else if(randomSpeed > 15.0){
        randomSpeed = 15.0;
    }
    Serial.println(randomSpeed);
    
}

void inputID(){
    String Data = String::format(", \"cont\": \"");
    Data.concat(ID);
    Data.concat("\"}");
    
    if(recorded.size() >= 1){
        if(recorded.at(0)[0] == '1' ){
        recorded.at(0).remove(0,1);
        recorded.at(0).remove(recorded.at(0).lastIndexOf('}'));
        recorded.at(0).concat(Data);
        Serial.println(recorded.at(0));
        }
    }
    
    return;
}

void PostHandler(const char *event, const char *data) {
  // Handle the integration response
  
  String output = String::format("POST Response:\n  %s\n  %s\n", event, data);
  Serial.println(output);
  
  int find = strlen(data);
  int apo = find;
  while(data[find] != ':' && find != 1){
      if(data[find] =='"'){
          apo = find;
      }
      find--;
      
  }
  //Serial.println("found :");
  if(data[find-1] == 'v' ){
      //Serial.println("found UV");
      String num(data + find + 1);
      num.remove(num.lastIndexOf('"'));
      thresUV = num.toFloat();
      //Serial.println(thresUV);
      alternat++;
  }
  String IDs(data);
  if(IDs.startsWith("{\"status\":\"OK\",\"message\":\"ID:") && alternat == 1){
      IDs.remove(IDs.lastIndexOf(','));
      ID = IDs.substring(29);
      
  }
  
  alternat = 0;
  
  return;
}
          


void setup() {

    Serial.begin(9600); //define the baud rate
    pinMode(button, INPUT_PULLDOWN);

    
    // Initialize the gps and turn it on    
    locationTracker.begin();
    locationTracker.gpsOn();
    
    pinMode(led, OUTPUT);
    
    //Initialize the UV sensor
    UVTracker.begin(VEML6070_1_T);
    state = S_stop;
    ID = "";
    
    Particle.subscribe("hook-response/hit", PostHandler, MY_DEVICES); 
    //need to subscribe and create the response handler
}



void loop() {
    //Serial.println(APIKEY);
    
    if(state == S_stop && digitalRead(button) == 1){
        while(digitalRead(button) == 1){ //wait till end of button press
            delay(1000);
        }
        Serial.println("start activity button press");
        curr = Activity();
        trys = 0;
        tSpeed = 0;
        state = S_record;
        duration = millis();
        stateMachine(&curr);
    }
    else if(millis() - lastSync > ONE_DAY_MILLIS ){
        Serial.println("over a day");
        recorded.clear();
        Particle.syncTime();
        lastSync = millis();
    }
    else{
        stateMachine(&curr);
        
    }
    
    if(WiFi.ready() & recorded.size() > 0){//send data
        //publishing stuff
        Serial.println("wifi ready and recorded.size > 0: current length of recorded:");
        Serial.println(recorded.size());
        
            Serial.println(recorded.at(0));
            Particle.publish("hit", recorded.at(0));
            delay(6000);
            recorded.erase(recorded.begin());
            inputID();
           
        //Particle.publish("hit", recorded.at(i));
        //recorded.clear();
    }
    
    if(locationTracker.gpsFix()){
        Serial.println("We got a fix!!");
    }
    
    
    locationTracker.updateGPS();
    delay(1000);
    
}

void stateMachine(Activity* curr){

    switch(state){
        case S_stop:
        //Serial.println("Stop");
            break;
        case S_record:
            Serial.println("Record");
            UVred = UVTracker.readUV();
            if(locationTracker.gpsFix()){
                rando();
                GPS gps = GPS(locationTracker.readLonDeg(), locationTracker.readLatDeg(), randomSpeed/*locationTracker.getSpeed()*/, UVred);
                String data = String::format("Fixed GPS: lon: %f, lat: %f, speed: %f, uv: %f", locationTracker.readLonDeg(), locationTracker.readLatDeg(), randomSpeed/*locationTracker.getSpeed()*/, UVred);
                Serial.println(data );
                curr->add(gps);
                trys = 0;
                if(locationTracker.getSpeed() < 0.01){ //or "0"
                    tSpeed++;
                }
                else{
                    tSpeed = 0;
                }
            }
            else {
                trys++;
                tSpeed++;
            }
            
            if(trys > 3){
                rando();
                GPS gps = GPS( -111.0,32.2, randomSpeed, UVred);
                //Serial.println("fix not found after 3 trys currentgps data");
                String data = String::format("Fixed GPS: lon: -1, lat: -1, speed: -1, uv: %.2f", UVred);
                //Serial.println(data);
                curr->add(gps);
                trys = 0;
            }
            if(tSpeed >= 30){
                state = S_pause;
                trys = 0;
                tSpeed = 0;
            }
            
            if(digitalRead(button) == 1){//activity stopped
                while(digitalRead(button) == 1){ // wait till end of button press
                    delay(1000);
                }
                Serial.println("stop activity button press duration was:");
                curr->setDuration(millis() - duration);
                //Serial.println(millis() - duration);
                duration = 0;
                trys = 0;
                tSpeed = 0;
                std::vector<String> checking = curr->allJSON();
                recorded.insert(recorded.begin(), checking.begin(), checking.end()); // add it to be sent to cloud
                state = S_stop;
                return;
            }
            
            if(UVTracker.readUV() > thresUV){
                //Serial.println("UV thres surpassed");
                digitalWrite(led, HIGH); //turn on led
            }
            else{
                digitalWrite(led, LOW); //turn off led
            }
            
            break;
        case S_pause:
            Serial.println("paused speed stopped");
            if(randomSpeed/*locationTracker.getSpeed()*/ > 0.01){
                state = S_record;
            }
            
            if(digitalRead(button) == 1){//activity stopped
                while(digitalRead(button) == 1){ // wait till end of button press
                    delay(1000);
                }
                //Serial.println("stop activity button press");
                curr->setDuration(millis() - duration);
                duration = 0;
                std::vector<String> checking = curr->allJSON();
                recorded.insert(recorded.begin(), checking.begin(), checking.end()); // add it to be sent to cloud
                state = S_stop;
                trys = 0;
                tSpeed = 0;
                return;
            }
            
            break;

        
    }
    
    
}