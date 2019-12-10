var db = require("../db");

var deviceSchema = new db.Schema({
    apikey:       String,
    deviceId:     String,
    userEmail:    String,
    uv: {type:Number, default: 10)
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
