var express = require('express');
var router = express.Router();
var path = require('path');


router.get('/',function(req,res){
 res.sendFile('userLogin.html', { root: './public/'});
});

module.exports = router;
