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
      units: "metric",
      cnt: "10"
    },
    success: function(data) {
      console.log('Received data:', data) // For testing
      var wf = "";
      wf += "<h2>" + data.city.name + "</h2>"; // City (displays once)
      $.each(data.list, function(index, val) {
        wf += "<p>" // Opening paragraph tag
        wf += "<b>Day " + index + "</b>: " // Day
        wf += val.main.temp + "&degC" // Temperature
        wf += "<span> | " + val.weather[0].description + "</span>"; // Description
        wf += "<img src='https://openweathermap.org/img/w/" + val.weather[0].icon + ".png'>" // Icon
        wf += "</p>" // Closing paragraph tag
      });
      $("#showWeatherForcast").html(wf);
    }
  });
}
