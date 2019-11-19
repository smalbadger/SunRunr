var db = require("../db");

// Define the schema
var activitySchema = new db.Schema({
    deviceId:   String,
    userEmail:  String,
    date:   { type: Date, default: Date.now },
    duration: Number,
    calories: Number,
    temperature: Number,
    humidity: Number,
    GPS: [{"lon":  Number, "lat":   Number, "GPS_speed": Number, "uv": Number}]
});

// Creates a Activities (plural) collection in the db using the activity schema
var Activity = db.model("activity", activitySchema);

module.exports = activitySchema;
