function getForecast(day){

}

function getFiveDayForecast(){
  var key = "152d954ed997be2bb0784df77bdd7781";
  var lat = "32.2226";
  var lon = "-110.9747";
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
      $("#weather").prepend("<h2>" + data.city.name + "</h2>")
      $.each(data.list, function(index, val) {
        createWeatherCard(val)
      });
    }
  });
}

function prettyTime(uglyTime){
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var d = new Date(uglyTime);
  d.setHours(d.getHours-9)
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

function createWeatherCard(val){
  $("#weather-forecast").append(
      "<div class='weather-card card blue-grey darken-1'>" +
        "<div class='card-title weather-card-title'>" + prettyTime(val.dt_txt.replace(' ', 'T')) + "</div>" +
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
