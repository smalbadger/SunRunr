#include "activity.h"

using namespace std;

    GPS::GPS(){
        this->longitude = 0.0;
        this->latitude = 0.0;
        this->speed = 0.0;
        this->uv = 0.0;
    
    }
    
    
    GPS::GPS(float lon, float lat, float spe, float u){
        this->longitude = lon;
        this->latitude = lat;
        this->speed = spe;
        this->uv = u;
        
    }
    
    
    float GPS::getLongitude(){
        
        return longitude;
        
    }
    
    float GPS::getLatitude(){
        return latitude;
        
    }
    float GPS::getUV(){
            return uv;
    }
    float GPS::getSpeed(){
            return speed;
    }
    
    Activity::Activity(){
        this->locations = vector<GPS>();
        this->duration = 0;
        this->date = Time.timeStr();
        
    }
    
    
    Activity::Activity(vector<GPS> loc, unsigned long dur){
        this->locations = loc;
        this->duration = dur;
        this->date = Time.timeStr();
        
    }
    
    vector<GPS> Activity::getGPS(){
        return locations;
    }
    
    void Activity::setDuration(unsigned long dur){
        this->duration = dur;
    }
    
    void Activity::add(GPS gps){
        this->locations.push_back(gps);
        return;
    }
    
    String Activity::createJson(){
        String data = String();
        for(int i = 0; i < locations.size(); i++){
            String curr = String::format("{\"lon:\" \"%.2f\", \"lat:\" \"%.2f\", \"speed:\" \"%.2f\", \"uv:\" \"%.2f\"}", this->locations.at(i).getLongitude(), this->locations.at(i).getLatitude(), this->locations.at(i).getSpeed(), this->locations.at(i).getUV() );
            data.concat(curr);
            if(i != locations.size() - 1){
                data.concat(", ");
            }
        }
        Serial.println(data);
        String Data = String::format("{\"date:\" \"");
        Data.concat(this->date);
        String header = String::format("\", \"duration:\" \"%lu\",  \"GPS:\" [", this->duration);
        Data.concat(header);
        Data.concat(data);
        Data.concat(" ]");
        Serial.println(Data);
        return Data;
        
    }
    
    String Activity::getDate(){
        return this->date;
        
    }
    
    
    
