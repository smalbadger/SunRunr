var mongoose = require("mongoose");

mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);

////////
nev = require('email-verification')(mongoose);
//////

mongoose.connect("mongodb://localhost/sunrunner", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

module.exports = mongoose;
