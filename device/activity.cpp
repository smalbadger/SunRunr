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
    
    std::vector<String> Activity::allJSON(){
        std::vector<String> Sending;
        Sending.push_back(createJson());
        
        while(this->locations.size() > 0){
            String one = String("1");
            one.concat(createJson());
            Sending.push_back(one);
        }
        return Sending;
    }
    
    String Activity::createJson(){
        String data = String();
        String lon = String("\"lon\": \"[ ");
        String lat = String("\"lat\": \"[");
        String Speed = String("\"speed\": \"[");
        String uv = String("\"uv\": \"[");
        int lengthi = this->locations.size();
        if(lengthi > 12){
            lengthi = 12;
        }
        for(int i = 0; i < lengthi; i++){
            lon.concat(String::format("%.4f", this->locations.at(i).getLongitude()));
            lat.concat(String::format("%.4f",  this->locations.at(i).getLatitude() ));
            Speed.concat(String::format("%.4f", this->locations.at(i).getSpeed()));
            uv.concat(String::format("%.2f",this->locations.at(i).getUV()));
            //data.concat(curr);
            if(i != lengthi - 1){
                lon.concat(", ");
                lat.concat(", ");
                Speed.concat(", ");
                uv.concat(", ");
            }
        }
        //Serial.println(this->locations.size());
        this->locations.erase(this->locations.begin(), this->locations.begin() + lengthi);
        //Serial.println(this->locations.size());
        lon.concat("]\", ");
        lat.concat("]\", ");
        Speed.concat("]\", ");
        uv.concat("]\" ");
        
        //Serial.println(data);
        String Data = String::format("{\"date\": \"");
        Data.concat(this->date);
        String header = String::format("\", \"duration\": \"%lu\",", this->duration);
        Data.concat(header);
        Data.concat(lon);
        Data.concat(lat);
        Data.concat(Speed);
        Data.concat(uv);
        Data.concat("}");
        //Serial.println(Data);
        return Data;
        
    }
    
    String Activity::getDate(){
        return this->date;
        
    }
    
    
    