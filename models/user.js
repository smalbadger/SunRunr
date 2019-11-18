var db = require("../db");

var userSchema = new db.Schema({
    email:        { type: String, required: true, unique: true },
    fullName:     { type: String, required: true },
    passwordHash: String,
    lastAccess:   { type: Date, default: Date.now },
    userDevices:  { type: [String] , required: true, unique: true },
    verified: { type: String, default: "disabled" }
});

var User = db.model("User", userSchema);

module.exports = User;
