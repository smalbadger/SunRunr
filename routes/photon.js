// this is for the photon particle
// this part grabs the info from the photon and check if its valid
const request = require('request');
const fetch = require("node-fetch");

var express = require('express');
var router = express.Router();

var User = require("../models/user");
var Device = require("../models/device");
var Activity = require("../models/activity");

async function getCurrentWeather(long, lati)
{
  var key = "152d954ed997be2bb0784df77bdd7781";

  var url = `https://api.openweathermap.org/data/2.5/weather?appid=152d954ed997be2bb0784df77bdd7781&lat=${lati}&lon=${long}`;
  let response = await fetch(url);
  let data = await response.json();
  return data;
}

function activityT(speed, duration){
    var avg = 0.0;
    var acti = {
        Typ: "",
        cal: 0
    };
    var tim = duration/(1000.0*60.0);
    for(var i = 0; i < speed.length; i++){
            avg += speed[i];
        }
    avg = avg/speed.length;
    if(avg < 4.0){
        acti.type = "Walking"; //79pmin
        acti.cal = 79.0*tim;
    }
    else if(avg < 6.0){
        acti.type = "Running";//36 pmin
        acti.cal = 36.0*tim;
    }
    else{
        acti.type = "Biking";//51 pmin
        acti.cal = 51.0*tim;
    }

    return acti;
}


/* POST: Register new device. */
router.post('/hit', function(req, res, next) {
    var responseJson = {
        status : "",
        message : ""
    };
    // Ensure the POST data include properties id and email
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing deviceId parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing apikey parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("date") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing date parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }
    if(!req.body.hasOwnProperty("cont")){
        responseJson.status = "ERROR";
        responseJson.message = "Request missing cont parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("duration") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing GPS parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }
    if( !req.body.hasOwnProperty("lon") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing latitude parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("lat") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing latitude parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing gps speed parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }
     if( !req.body.hasOwnProperty("uv") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing uv parameter.";
        return res.status(400).send(JSON.stringify(responseJson));
    }

    var gps = [];
        var lon = JSON.parse(req.body.lon);
        var lat = JSON.parse(req.body.lat);
        var speed = JSON.parse(req.body.speed);
        var uv = JSON.parse(req.body.uv);

        for(var i = 0; i < lon.length; i++){
            gps.push({
                lon: lon[i].toFixed(3),
                lat: lat[i].toFixed(3),
                speed: speed[i].toFixed(3),
                uv: uv[i].toFixed(3)
            });
        }

    if(req.body.cont == ''){ //not a continuation of a Activity
        var ActType = activityT(speed, req.body.duration);

    var weather = {
        temp: 0,
        humidity: 0,
        };

        getCurrentWeather(lon[0], lat[0]).then(function(data) {
            weather.humidity = data.main.humidity;
            weather.temp = data.main.temp;


        // Find the device and verify the apikey
            Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
                if (device !== null) {
                    if (device.apikey != req.body.apikey) {
                        responseJson.status = "ERROR";
                        responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
                        return res.status(400).send(JSON.stringify(responseJson));
                    }
                    else {
                        var UVstr = "Max Uv:" + device.uv;

                        // Create a new hw data with user email time stamp
                        var newActivity = new Activity ({
                            userEmail: device.userEmail,
                            deviceid: req.body.deviceId,
                            GPS: gps,
                            date: req.body.date,
                            duration: req.body.duration,
                            calories: ActType.cal,
                            temperature: weather.temp,
                            humidity: weather.humidity,
                            aType: ActType.type

                        });
                        //console.log(newActivity);
                        // Save device. If successful, return success. If not, return error message.
                        newActivity.save(function(err, newActivity) {
                            if (err) {
                                responseJson.status = "ERROR";
                                responseJson.message = "Error saving data in db.";
                                return res.status(400).send(JSON.stringify(responseJson));
                            }
                            else {
                                responseJson.status = "OK";
                                responseJson.message = "ID:" + newActivity._id + "," + UVstr;

                                return res.status(201).send(JSON.stringify(responseJson));
                            }
                        });
                    }
                }
                else {
                    responseJson.status = "ERROR";
                    responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
                    return res.status(400).send(JSON.stringify(responseJson));
                }
            });
        }).catch((error) => {
            console.log(error)
            responseJson.status = "ERROR";
            responseJson.message = "Error in weather api return. Error message is: " + error;
            return res.status(400).send(JSON.stringify(responseJson));
          });
    }
    else{


        Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
            if (device !== null) {
                if (device.apikey != req.body.apikey) {
                    responseJson.status = "ERROR";
                    responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
                    return res.status(400).send(JSON.stringify(responseJson));
                }
                else {
                    var UVstr = "Max Uv:" + device.uv;
                    Activity.findByIdAndUpdate({_id: req.body.cont}, { $push: { GPS: {$each: gps} } },{  safe: true}, function(err, result){
                        if (err) {
                            responseJson.status = "ERROR";
                            responseJson.message = "Error updating activity data in db.";
                            return res.status(400).send(JSON.stringify(responseJson));
                            console.log("error resaving activity");
                        }
                        else {

                            responseJson.status = "OK";
                            responseJson.message = "activity data has been added, " + "ID:" + req.body.cont +"," + UVstr;

                            return res.status(201).send(JSON.stringify(responseJson));
                        }
                    });
                }
            }
            else {
                responseJson.status = "ERROR";
                responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
                return res.status(400).send(JSON.stringify(responseJson));
            }
        });

    }
});

module.exports = router;
