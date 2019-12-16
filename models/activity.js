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
    GPS: [{"lon":  Number, "lat":   Number, "speed": Number, "uv": Number}]

    //TODO: Add activity type field and set it to a default when the activity is
    //      posted. The default should be calculated via the activity speed.
});

// Creates a Activities (plural) collection in the db using the activity schema
var Activity = db.model("Activity", activitySchema);

module.exports = Activity;
