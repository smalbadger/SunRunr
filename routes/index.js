var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('userLogin', { title: 'SunRunr' });
//});
router.get('/',function(req,res){
 //res.sendFile(path.join('../public/userLogin.html'));
 res.sendFile('userLogin.html', { root: './public/'});
// __dirname : It will resolve to your project folder.
});

module.exports = router;

console.log('index routes');
