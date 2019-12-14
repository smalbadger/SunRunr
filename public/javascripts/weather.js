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
  var amorpm = "pm";
  var hours = d.getHours();
  if (hours < 12) {amorpm = "am"}
  else {hours -= 12}
  return dayNames[d.getDay()] + ", " + monthNames[d.getMonth()] + ". " + d.getDate() + "<br>" + hours + " " + amorpm;
}

function createWeatherCard(val){
  $("#weather-forecast").append(
      "<div class='weather-card card blue-grey darken-1'>" +
        "<div class='card-title'>" + prettyTime(val.dt_text.replace(' ', 'T')) + "</div>" +
        "<div class='card-image weather-icon-container' style='width:45px;'>" +
          "<img style='width:45px height:45px;' class='weather-icon' src='https://openweathermap.org/img/w/" + val.weather[0].icon + ".png'>" +
        "</div>" +
        val.main.temp + "&degF" +
        "<span> | " + val.weather[0].description + "</span>" +
      "</div>"
  )
}
