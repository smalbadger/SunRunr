// this is for the photon particle
// this part grabs the info from the photon and check if its valid

var express = require('express');
var router = express.Router();

var User = require("../models/user");
var Device = require("../models/device");
var Activity = require("../models/activity");

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
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing apikey parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("GPS") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing GPS parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    if( req.body.GPS.isEmpty() ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing GPS is empty parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
    
    if( !req.body.hasOwnProperty("lat") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing latitude parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    if( !req.body.hasOwnProperty("speed") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing gps speed parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }
     if( !req.body.hasOwnProperty("uv") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing uv parameter.";
        return res.status(201).send(JSON.stringify(responseJson));
    }

    // Find the device and verify the apikey
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
            if (device.apikey != req.body.apikey) {
                responseJson.status = "ERROR";
                responseJson.status = "ERROR";
                responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
                return res.status(201).send(JSON.stringify(responseJson));
            }
            else {
                // Create a new hw data with user email time stamp
                var newActivity = new Activity ({
                    userEmail: device.userEmail,
                    deviceid: req.body.deviceId,
                    lon: req.body.lon,
                    lat: req.body.lat,
                    speed: req.body.speed,
                    uv: req.body.uv
                });

                // Save device. If successful, return success. If not, return error message.
                newActivity.save(function(err, newActivity) {
                    if (err) {
                        responseJson.status = "ERROR";
                        responseJson.message = "Error saving data in db.";
                        return res.status(201).send(JSON.stringify(responseJson));
                    }
                    else {
                        responseJson.status = "OK";
                        responseJson.message = "Data saved in db with object ID " + newActivity._id + ".";

                        return res.status(201).send(JSON.stringify(responseJson));
                    }
                });
            }
        }
        else {
            responseJson.status = "ERROR";
            responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
            return res.status(201).send(JSON.stringify(responseJson));
        }
    });
});

module.exports = router;
