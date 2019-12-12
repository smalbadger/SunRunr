#ifndef ACTIVITY_H
#define ACTIVITY_H

#include <vector>
#include <string>
#include "application.h"


class GPS{
 private:
    float longitude;
    float latitude;
    float speed;
    float uv;
 
 public:
    GPS();
    GPS(float lon, float lat, float spe, float u);
    float getLongitude();
    float getLatitude();
    float getSpeed();
    float getUV();
    
};


class Activity{
    
private:
    std::vector<GPS> locations;
    unsigned long duration;
    String date;
public:
    Activity();
    Activity(std::vector<GPS> loc, unsigned long dur);
    std::vector<GPS> getGPS();
    String getDate();
    void add(GPS gps);
    void setDuration(unsigned long dur);
    String createJson();
    std::vector<String> allJSON();


};



#endif
