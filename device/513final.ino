// This #include statement was automatically added by the Particle IDE.
#include "activity.h"

// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_VEML6070.h>

// This #include statement was automatically added by the Particle IDE.
#include <AssetTracker.h>

#include <vector>


using namespace std;

#define ONE_DAY_MILLIS (24 * 60 * 60 * 1000)

Adafruit_VEML6070 UVTracker = Adafruit_VEML6070();
AssetTracker locationTracker = AssetTracker();

int button = A1;
int led = D7;

float thresUV = 10.0;

vector<Activity> recorded = vector<Activity>();


unsigned long lastSync = millis();
bool executeStateMachines = false;

unsigned long duration = 0;
enum State {S_stop, S_record, S_pause};

State state;


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
    
    
    //need to subscribe and create the response handler
}

void loop() {
    if(state == S_stop && digitalRead(button) == 1){
        while(digitalRead(button) == 1){ //wait till end of button press
            delay(1000);
        }
        state = S_record;
        duration = millis();
        stateMachine();
    }
    else if(WiFi.ready() & recorded.size() > 0){//send data
        //publishing stuff
        
        recorded.clear();
    }
    else if(millis() - lastSync > ONE_DAY_MILLIS ){
        Serial.println("over a day");
        recorded.clear();
        Particle.syncTime();
        lastSync = millis();
    }
    else{
        Serial.println(state);
        locationTracker.updateGPS();
        stateMachine();
        delay(1000);
    }
    
    
}

void stateMachine(){
    Activity curr;
    int trys = 0;
    int tSpeed = 0;
    switch(state){
        case S_stop:
        Serial.println("Stop");
            break;
        case S_record:
            Serial.println("Record");
            if(locationTracker.gpsFix()){
                GPS gps = GPS(locationTracker.readLonDeg(), locationTracker.readLatDeg(), locationTracker.getSpeed(), UVTracker.readUV());
                String data = String::format("Fixed GPS: lon: %f, lat: %f, speed: %f, uv: %f", locationTracker.readLonDeg(), locationTracker.readLatDeg(), locationTracker.getSpeed(), UVTracker.readUV());
                Serial.println(data );
                curr.add(gps);
                trys = 0;
                if(locationTracker.getSpeed() < 0.5){ //or "0"
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
                GPS gps = GPS(-1.0, -1.0, -1.0, UVTracker.readUV());
                Serial.println("fix not found after 3 trys");
                curr.add(gps);
                trys = 0;
                tSpeed = 0;
            }
            else if(tSpeed >= 30){
                state = S_pause;
                trys = 0;
                tSpeed = 0;
            }
            
            if(digitalRead(button) == 1){//activity stopped
                while(digitalRead(button) == 1){ // wait till end of button press
                    delay(1000);
                }
                Serial.println("stop activity button press");
                curr.setDuration(millis() - duration);
                duration = 0;
                recorded.push_back(curr); // add it to be sent to cloud
                state = S_stop;
                return;
            }
            
            if(UVTracker.readUV() > thresUV){
                Serial.println("UV thres surpassed");
                digitalWrite(led, HIGH); //turn on led
            }
            else{
                digitalWrite(led, LOW); //turn off led
            }
            
            break;
        case S_pause:
            Serial.println("paused speed stopped");
            if(locationTracker.getSpeed() > 0.5){
                state = S_record;
            }
            
            break;

        
    }
    
    
}