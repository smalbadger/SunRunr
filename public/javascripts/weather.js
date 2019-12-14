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
      units: "standard",
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

function createWeatherCard(val){
  $("#weather-forecast").append(
      "<div class='weatherCard'>" +
        val.main.temp + "&degF" +
        "<span> | " + val.weather[0].description + "</span>" +
        "<img src='https://openweathermap.org/img/w/" + val.weather[0].icon + ".png'>" +
      "</div>"
  )
}
