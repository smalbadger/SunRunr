let express = require('express');
let router = express.Router();

let User = require("../models/user");
let Device = require("../models/device");
let Activity = require("../models/activity");

let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");

var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

// Data for testing. These values will be changed for testing.
var activities = {
	"Running": "Soon to be determined",
	"Jogging": "Soon to be determined",

};

// TODO: Create endpoint to change activity type. This should also recalculate
//       calories burned and update it in the activity.

// TODO: Create endpoint to change activity email (in case the user email changes)

// GET request return one or "all" activities of one User
router.get('/all', function(req, res, next) {
	let responseJson = { activities: [] };


    let email = "";

    // If authToken provided, use email in authToken
    if (req.headers["x-auth"]) {
        try {
            let decodedToken = jwt.decode(req.headers["x-auth"], secret);
            email = decodedToken.email;
        }
        catch (ex) {
            responseJson.message = "Invalid authorization token.";
            return res.status(400).json(responseJson);
        }
    }
    else {
        // Ensure the request includes the email parameter
        if( !req.body.hasOwnProperty("email")) {
            responseJson.message = "Invalid authorization token or missing email address.";
            return res.status(400).json(responseJson);
        }
        email = req.body.email;
    }

    // if the user inputs 'all' then this outputs all activities
    //if ( activitiesId == "all") {
        let query = {"userEmail": email};
    /*}
    else { //otherwise this looks for the specific activities
        //let query = { "activitiesId" : activitiesId, "email": req.body.email };
    }*/


    Activity.find(query, function(err, allActivities) {
        if (err) {
            let errorMsg = {"message" : err};
            res.status(400).json(errorMsg);
        }
        else {
            for(let activity of allActivities) {
                responseJson.activities.push({ activity});
            }
        }
        res.status(200).json(responseJson);
    });
});


// GET request return all activities within certain radius within past 7 days
router.get('/allAct', function(req, res, next) {
    let responseJson = { activities: [] };


    let email = "";

    // // If authToken provided, use email in authToken
    // if (req.headers["x-auth"]) {
    //     try {
    //         let decodedToken = jwt.decode(req.headers["x-auth"], secret);
    //         email = decodedToken.email;
    //     }
    //     catch (ex) {
    //         responseJson.message = "Invalid authorization token.";
    //         return res.status(400).json(responseJson);
    //     }
    // }
    // else {
    //     // Ensure the request includes the email parameter
    //     if( !req.body.hasOwnProperty("email")) {
    //         responseJson.message = "Invalid authorization token or missing email address.";
    //         return res.status(400).json(responseJson);
    //     }
    //     email = req.body.email;
    // }

    //var query = {
        lon = req.body.lng; //user lon
        lat = req.body.lat; //user lat
        radius = req.body.rad * (360/24901); //radius around the user
        console.log(lat);
        console.log(lon);
        console.log(radius);

    //}


    // go through users and find all activities within the radius within past seven days
    Activity.find({}, function(err, allActivities) {
        if (err) {
            let errorMsg = {"message" : err};
            res.status(400).json(errorMsg);
        }
        else {
            //console.log(allActivities);

            for(let activity of allActivities) {
                var current = new Date();

                var days30 = 2592000;
                var days7 = 604800;


                console.log(Date.parse(current));
                console.log(Date.parse(activity.date.toISOString()));


                if( (Date.parse(activity.date.toISOString()) + days30) >=  Date.parse(current) ) {

                    console.log(activity.GPS[0]);
                    console.log(activity.GPS[0].lat);
                    console.log(activity.GPS[0].lon);
                    console.log ( Math.sqrt( Math.pow( (lon - activity.GPS[0].lon) ,2) + Math.pow( (lat - activity.GPS[0].lat) ,2)) );
                    if( Math.sqrt( Math.pow( (lon - activity.GPS[0].lon) ,2) + Math.pow( (lat - activity.GPS[0].lat) ,2)) <= radius) {
                        responseJson.activities.push({ activity});
                }
            }
        }
    }
    res.status(200).json(responseJson);
});

});

 
module.exports = router;

console.log('activity routes');


