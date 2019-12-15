let express = require('express');
let router = express.Router();

let User = require("../models/user");
let Device = require("../models/device");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");

/* Authenticate user */
// check if the user already exists
var secret = fs.readFileSync(__dirname + '/../../jwtkey').toString();

router.post('/signin', function(req, res, next) {
    User.findOne({email: req.body.email}, function(err, user) {
        if (err) { // couldnt connect to the database
            res.status(503).json({success : false, message : "Can't connect to DB."});
        }
        else if(!user) { // couldnt authenticate the user
            res.status(401).json({success : false, message : "Email or password invalid."});
        }
        else {
            bcrypt.compare(req.body.password, user.passwordHash, function(err, valid) {
                if (err) {
                    res.status(512).json({success : false, message : "Error authenticating. Contact support."});
                }
                else if(valid) { // user was authenticated
                    var authToken = jwt.encode({email: req.body.email}, secret);
                    res.status(201).json({success:true, authToken: authToken});
                }
                else { // user was found but not valid password
                    res.status(401).json({success : false, message : "Email or password invalid."});
                }
            });
        }
    });
});

/* Registering a new user */
router.post('/register', function(req, res, next) {

    if (!req.body.hasOwnProperty("email")){
      return res.status(400).json({success:false, message: "Must provide email."})
    }
    if (!req.body.hasOwnProperty("fullName")){
      return res.status(400).json({success:false, message: "Must provide full name."})
    }
    if (!req.body.hasOwnProperty("password")){
      return res.status(400).json({success:false, message: "Must provide password."})
    }

    bcrypt.hash(req.body.password, 10, function(err, hash) {
      if (err) {
         res.status(400).json({success : false, message : err.errmsg});
      }
      else {
        var newUser = new User ({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
            userDevices:[]
        });

        newUser.save(function(err, user) {
          if (err) {
             res.status(400).json({success : false, message : err.errmsg});
          }
          else {
             res.status(201).json({success : true, message : user.fullName + "has been created"});
          }
        });
      }
   });
});


// getting user info
router.get("/account" , function(req, res) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({success: false, message: "No authentication token"});
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        var userStatus = {};

        User.findOne({email: decodedToken.email}, function(err, user) {
            if(err || user === null) {
                return res.status(400).json({success: false, message: "User does not exist."});
            }
            else {
                userStatus['success'] = true;
                userStatus['email'] = user.email;
                userStatus['fullName'] = user.fullName;
                userStatus['lastAccess'] = user.lastAccess;

                // Find devices based on decoded token
                Device.find({ userEmail : decodedToken.email}, function(err, devices) {
                    if (!err) {
                        // Construct device list
                        let deviceList = [];
                        for (device of devices) {
                            deviceList.push({
                                deviceId: device.deviceId,
                                apikey: device.apikey,
                            });
                        }
                        userStatus['devices'] = deviceList;
                    }

                    return res.status(200).json(userStatus);
                });
            }
        });
    }
    catch (ex) {
        return res.status(401).json({success: false, message: "Invalid authentication token."});
    }
});


// updating user info
router.put("/updateuser" , function(req, res) {
    // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({success: false, message: "No authentication token"});
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        var userStatus = {};

        // find the user and make sure they exist in the database
        User.findOne({email: decodedToken.email}, function(err, user) {
            if(err) {
                return res.status(400).json({success: false, message: "User does not exist."});
            }
            else {
                User.findOneAndUpdate({ email: decodedToken.email }, {$set:{email: req.body.email, fullName: req.body.fullName}} , function(err, user) {
                    if (err) {
                        console.log(err)
                        return res.status(400).json(err);
                    } else if (user) {
                        console.log("updated")
                        var authToken = jwt.encode({email: req.body.email}, secret);
                        return res.status(204).send({success: true, message: "User " + req.body.email + " was updated.", authToken: authToken});
                    } else {
                        return res.status(400).json({success: false, message: "User " + req.body.email + " was not found."});
                    }
                });
            }
        });
    }
    catch (ex) {
        return res.status(401).json({success: false, message: "Invalid authentication token."});
    }
});


// getting all users within a certain radius for past 7 days
// router.get("/allusers" , function(req, res) {
//     // Check for authentication token in x-auth header
//     if (!req.headers["x-auth"]) {
//         return res.status(401).json({success: false, message: "No authentication token"});
//     }

//     var authToken = req.headers["x-auth"];

//     try {
//         var decodedToken = jwt.decode(authToken, secret);
//         var userStatus = {};

//         var query = {
//             lon = req.body.lng; //user lon
//             lat = req.body.lat; //user lat
//             radius = req.body.rad; //radius around the user
//         }

//         // var R = 6371e3; // metres
//         // var φ1 = lat1.toRadians();
//         // var φ2 = lat2.toRadians();
//         // var Δφ = (lat2-lat1).toRadians();
//         // var Δλ = (lon2-lon1).toRadians();

//         // var Δψ = Math.log(Math.tan(Math.PI/4+φ2/2)/Math.tan(Math.PI/4+φ1/2));
//         // var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0

//         // // if dLon over 180° take shorter rhumb line across the anti-meridian:
//         // if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

//         // var dist = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ) * R;

//         // find the all users
//         User.find({email: decodedToken.email}, function(err, user) {
//             if(err) {
//                 return res.status(400).json({success: false, message: "User does not exist."});
//             }
//             else {
//                 User.findOneAndUpdate({ email: decodedToken.email }, {$set:{email: req.body.email, fullName: req.body.fullName}} , function(err, user) {
//                     if (err) {
//                         console.log(err)
//                         return res.status(400).json(err);
//                     } else if (user) {
//                         console.log("updated")
//                         return res.status(204).json("User " + req.body.email + " was updated.");
//                     } else {
//                         return res.status(400).json("User " + req.body.email + " was not found.");
//                     }
//           });
//             }
//         });
//     }
//     catch (ex) {
//         return res.status(401).json({success: false, message: "Invalid authentication token."});
//     }
// });

module.exports = router;
