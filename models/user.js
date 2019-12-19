var db = require("../db");

var userSchema = new db.Schema({
    email:        { type: String, required: true, unique: true },
    fullName:     { type: String, required: true },
    passwordHash: { type: String, required: true },
    lastAccess:   { type: Date, default: Date.now },
    userDevices:  { type:[String], default:[], sparse:true},
    verified:     { type: Boolean, default: false },
    //createdAt:    { type: Date, required: true, default: Date.now, expires: 3600},

    passwordResetToken: String,
    passwordResetExpires: Date,

    // Even though this is stored in the devices as well, it's convenient to 
    // store it here as well since we're only allowing the user to edit a
    // single UV setting.
    uv_threshold: { type: Number, default: 10}
});

var User = db.model("User", userSchema);

module.exports = User;
