function getForecast(day){

}

function getFiveDayForecast(pos){

  $.ajax({
    url: '/weather/forecast?lat='+pos.coords.latitude+"&lon="+pos.coords.longitude,
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      console.log('Received data:', data) // For testing
      $("#weather").prepend("<div class='card-title white-text center-align'>" + data.city.name + " Weather Forecast</div>")
      $.each(data.list, function(index, val) {
        createWeatherCard(val, data.city.timezone)
      });
    }
  });

/*
  var key = "152d954ed997be2bb0784df77bdd7781";
  var lat = pos.coords.latitude;
  var lon = pos.coords.longitude;
  var url = "https://api.openweathermap.org/data/2.5/forecast";

  $.ajax({
    url: url, //API Call
    dataType: "json",
    type: "GET",
    data: {
      lat: lat,
      lon: lon,
      appid: key,
      units: "Imperial",
    },
    success: function(data) {
      console.log('Received data:', data) // For testing
      $("#weather").prepend("<div class='card-title white-text center-align'>" + data.city.name + " Weather Forecast</div>")
      $.each(data.list, function(index, val) {
        createWeatherCard(val, data.city.timezone)
      });
    }
  });
  */
}

function prettyDateTime(uglyTime, timezoneAdjustment){
  const dayNames = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var adjustment = -timezoneAdjustment/60/60
  var a = 0;
  for (a=0; a<adjustment; a+=3){}

  var d = new Date(uglyTime);
  d.setHours(d.getHours()-Math.max(adjustment, a))

  console.log("Calculated Time: " + d.toString());

  var amorpm = "pm";
  var hours = d.getHours();
  if (hours < 12) {amorpm = "am"}
  else if (hours > 12){hours -= 12}
  if (hours == 0){hours = 12}

  var date = dayNames[d.getDay()] + ", " + monthNames[d.getMonth()] + ". " + d.getDate()

  var time = ""
  if (hours != 12){
    time = hours + " " + amorpm;
  }
  else if (amorpm == "am"){
    time = "Midnight"
  }
  else {
    time = "Noon"
  }

  return date + "</br><b>" + time + "</b>";
}

function createWeatherCard(val, timezone){
  $("#weather-forecast").append(
      "<div class='weather-card card teal lighten-1'>" +
        "<div class='card-title weather-card-title'><b>" + prettyDateTime(val.dt_txt.replace(' ', 'T'), timezone) + "</b></div>" +
        "<div class='row'>" +
          "<div class='col s6 card-image weather-icon-container'>" +
            "<img style='width:45px height:45px;' class='weather-icon' src='https://openweathermap.org/img/w/" + val.weather[0].icon + ".png'>" +
          "</div>" +
          "<div class='col s6' style='padding-top:15px; padding-left:2px;'>" +
            val.main.temp + "&degF<br>" + val.main.humidity + "% humidity" +
          "</div" +
        "</div>" +
      "</div>"
  )
}
