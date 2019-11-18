#include "activity.h"

using namespace std;

    GPS::GPS(){
        this->longitude = 0.0;
        this->latitude = 0.0;
        this->speed = 0.0;
    
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
    
    