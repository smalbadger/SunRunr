let express = require('express');
let router = express.Router();

let User = require("../models/user");
let Device = require("../models/device");
let Activity = require("../models/activity");
let fs = require('fs');
let bcrypt = require("bcryptjs");
let jwt = require("jwt-simple");


////////////////////////////////
//router.post('/confirmation', userController.confirmationPost);
//router.post('/resend', userController.resendTokenPost);

var crypto = require('crypto');
var nodemailer = require('nodemailer');
let Token = require("../models/token");
var smtpTransport = require('nodemailer-smtp-transport');

///////////////////////////////

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

                    //////////////////////////////////////////////////////////////
                    // Make sure the user has been verified
                    //if (!user.verified) return res.status(401).send({ type: 'not-verified', msg: 'Your account has not been verified.' });

                    // Login successful, write token, and send back user
                    //res.status(201).send({ token: generateToken(user), user: user.toJSON() });
                    //var authToken = jwt.encode({email: req.body.email}, secret);
                    //res.status(201).json({success:true,token: generateToken(user), authToken: authToken});
                    ///////////////////////////////////////////////////////////////

                    User.update({email: req.body.email}, {lastAccess:Date.now()}, function(err, user) {
                      if (err){
                        res.status(400).json(err)
                      } else if (user){
                        var authToken = jwt.encode({email: req.body.email}, secret);
                        res.status(201).json({success:true, authToken: authToken});
                      }
                      else {
                        res.status(400).json({success : false, message : "Couln't set lastAccess."})
                      }
                    })
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
            ////////////////////////////////////////////////////////////////////
            // Create a verification token for this user
            var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });

            // Save the verification token
            token.save(function (err) {
                if (err) {
                    console.log("cant save token" );
                    return res.status(500).send({ msg: err.message});
                }
                /////////////////////////////////////
                // Generate test SMTP service account from ethereal.email
                // nodemailer.createTestAccount((err, account) => {
                //     if (err) {
                //         console.error('Failed to create a testing account. ' + err.message);
                //         return process.exit(1);
                //     }
                //     console.log('Credentials obtained, sending message...');
                //     // create reusable transporter object using the default SMTP transport
                //         const transporter = nodemailer.createTransport({
                //             host: 'smtp.ethereal.email',
                //             port: 587,
                //             auth: {
                //                 user: 'ferne.klein88@ethereal.email',
                //                 pass: 'C6FeEPzVc9X23mac63'
                //             }
                //         });
                //                    // setup e-mail data with unicode symbols
                //     var mailOptions = {
                //         from: 'no-reply@whatanutcase.com', // sender address
                //         to: user.email, // list of receivers
                //         subject: 'Account Verification Token', // Subject line
                //         text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n', // plaintext body
                //         html: "<b>Hello world </b>" // html body
                //     }

                //     // send mail with defined transport object
                //     transporter.sendMail(mailOptions, function(error, response){
                //         if(error){
                //             console.log("cant send verification email");
                //             console.log(error);
                //             return res.status(500).send({ msg: err.message });
                //         }
                //         else{
                //             console.log("Message sent: " + response.message);
                //             res.status(201).json({success : true, message : user.fullName + "has been created"});
                //         }

                //         // if you don't want to use this transport object anymore, uncomment following line
                //         //smtpTransport.close(); // shut down the connection pool, no more messages
                //     });
                //     console.log(user.email);
                //     console.log('Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n');
                // });

                url =  'http://' + req.headers.host + '/confirmation/' + token.token;
                console.log(url);

                var transporter = nodemailer.createTransport(smtpTransport({
                    service: "Gmail",
                    host: 'smtp.gmail.com',
                    auth: {
                        user: "whatanutcaseece@gmail.com",
                        pass: "ECE-sunrunner513"
                    }
                }));

                var mailOptions = {
                    from: 'whatanutcaseece@gmail.com', // sender address
                    to: user.email, // list of receivers
                    subject: 'Account Verification Token', // Subject line
                    text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n', // plaintext body
                    html: "<b>Hello,</b><br><br><p>Please verify your account by clicking the link: <a href='url'>This link</a>.<br></p>" // html body
                };

                transporter.sendMail(mailOptions, function(error, response){
                    if(error){
                        console.log(error);
                    }
                    else{
                        //console.log("Message sent: " + response.message);
                        res.redirect('/');
                    }
                });



                ////////////////////////////////////
                // Send the email
                // var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
                // var mailOptions = { from: 'no-reply@whatanutcase.com', to: user.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
                // transporter.sendMail(mailOptions, function (err) {
                //     if (err) {
                //         console.log("cant send verification email");
                //         return res.status(500).send({ msg: err.message });
                //     }
                //     res.status(201).json({success : true, message : user.fullName + "has been created"});
                // });
            });
            ////////////////////////////////////////////////////////////////////
            //res.status(201).json({success : true, message : user.fullName + "has been created"});
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
                userStatus['uv_threshold'] = user.uv_threshold;

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
                User.findOneAndUpdate({ email: decodedToken.email }, {$set:{email: req.body.email, fullName: req.body.fullName, uv_threshold:req.body.uv_threshold}} , function(err, user) {
                    if (err) {
                        return res.status(400).json(err);
                    }
                    else if (user) {

                        Device.update({ userEmail : decodedToken.email }, {$set:{uv: req.body.uv_threshold}} ,{ multi: true }, function(err, status) {
                          console.log("Devices UV threshold set");
                        });

                        if (decodedToken.email != req.body.email)
                        {
                          // Find all activities based on decoded token and change it to the new email
                          Activity.update({ userEmail : decodedToken.email }, {$set:{userEmail: req.body.email}} ,{ multi: true }, function(err, status) {
                            console.log("Activities' email updated");
                          });

                          // Find all devices based on decoded token and change it to the new email
                          Device.update({ userEmail : decodedToken.email }, {$set:{userEmail: req.body.email}} ,{ multi: true }, function(err, status) {
                            console.log("Devices' email updated");
                          });
                        }

                        var authToken = jwt.encode({email: req.body.email}, secret);
                        return res.status(200).json({success: true, message: "User " + req.body.email + " was updated.", authToken: authToken});

                    }
                    else
                    {
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


// confirmation
router.get("/confirmation" , function(req, res) {
   // Check for authentication token in x-auth header
    if (!req.headers["x-auth"]) {
        return res.status(401).json({success: false, message: "No authentication token"});
    }

    var authToken = req.headers["x-auth"];

    try {
        var decodedToken = jwt.decode(authToken, secret);
        var userStatus = {};

        // Find a matching token
        Token.findOne({ token: req.body.token }, function (err, token) {
            if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

            // If we found a token, find a matching user
            User.findOne({ _id: token._userId, email: req.body.email }, function (err, user) {
                if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
                if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

                // Verify and save the user
                user.isVerified = true;
                user.save(function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
                    res.status(200).send("The account has been verified. Please log in.");
                });
            });
        });
    }
    catch (ex) {
        return res.status(401).json({success: false, message: "Invalid authentication token."});
    }
});


module.exports = router;
