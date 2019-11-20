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


// GET request return one or "all" activities of one User 
router.get('/all', function(req, res, next) {
	let responseJson = { activities: [] };


    let email = "";

    // If authToken provided, use email in authToken
    if (req.headers["x-auth"]) {
	    console.log(req.header);
        try {
            let decodedToken = jwt.decode(req.headers["x-auth"], secret);
            email = decodedToken.email;
		console.log(decodedToken.email);
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
		    console.log(doc);
                responseJson.activities.push({ activity}); 
            }
        }
        res.status(200).json(responseJson);
    });
});

module.exports = router;
