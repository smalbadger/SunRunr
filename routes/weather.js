const request = require('request');
let express = require('express');
let router = express.Router();

router.get("/forecast/:lat/:lon" , function(req, response) {
  var key = "152d954ed997be2bb0784df77bdd7781";
  var lat = req.params.lat;
  var lon = req.params.lon;
  var url = `https://api.openweathermap.org/data/2.5/forecast?appid=${key}&lat=${lat}&lon=${lon}&units=Imperial`;
  request(url, { json: true }, (err, res, body) => {
    if (err) {
      response.status(400).send(err);
    } else {
      response.status(200).send(body);
    }
  });
});

router.get("/curren/:lat/:lon" , function(req, response) {
  var key = "152d954ed997be2bb0784df77bdd7781";
  var lat = req.params.lat;
  var lon = req.params.lon;
  var url = `https://api.openweathermap.org/data/2.5/weather?appid=${key}&lat=${lat}&lon=${lon}`;
  console.log(url);
  request(url, { json: true }, (err, res, body) => {
    if (err) {
      response.status(400).send(err);
    } else {
      response.status(200).send(body);
    }
  });
});

module.exports = router;
