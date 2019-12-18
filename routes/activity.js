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
router.get('/allAct/:lat/:lon/:rad', function(req, res, next) {
    let responseJson = { activities: [] };

    lon = req.params.lon; //user lon
    lat = req.params.lat; //user lat
    radius = req.params.rad * (360/24901); //radius around the user

    // go through users and find all activities within the radius within past seven days
    Activity.find({}, function(err, allActivities) {
        if (err) {
            let errorMsg = {"message" : err};
            res.status(400).json(errorMsg);
        }
        else {
						Date.prototype.addDays = function(days) {
						    var date = new Date(this.valueOf());
						    date.setDate(date.getDate() + days);
						    return date;
						}

            for(let activity of allActivities) {
								var actDate = new Date(activity.date)
                var current = new Date();

								var alat = activity.GPS[0].lat
								var alon = activity.GPS[0].lon

                // console.log(Date.parse(current));
                // console.log(Date.parse(activity.date.toISOString()));

                if(actDate.addDays(7) >= current) {
										const metersPerMile = 1609.34;

										const R = 6371e3; // metres
										var phi1 = lat * Math.PI/180
										var phi2 = alat * Math.PI/180
										var deltaphi = (alat-lat) * Math.PI/180
										var deltalambda = (alon-lon) * Math.PI/180

										var a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
										        Math.cos(phi1) * Math.cos(phi2) *
										        Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
										var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
										var dist = R * c / metersPerMile;

										console.log("CURRENT LAT: " + lat);
                    console.log("CURRENT LON: " + lon);
                    console.log("ACTIVITY LAT: " + activity.GPS[0].lat);
                    console.log("ACTIVITY LON: " + activity.GPS[0].lon);
                    console.log("DIST: " + dist);
										console.log("RADIUS: " + rad);
										console.log("");
                    if(dist <= radius) {
                        responseJson.activities.push(activity);
                    }
                }
            }
        }
        res.status(200).json(responseJson);
    });

    // console.log(lat);
    // console.log(lon);
    // console.log(radius);

});


module.exports = router;
