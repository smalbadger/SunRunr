


function addGPSTogether(GPS){
var str;
  for(var gps in GPS){
    str += "</br>lon: " + gps.lon + " lat: " + gps.lat + " speed: " + gps.speed + " uv: " + gps.uv;
  }
  console.log(str);
  return str;
}

function addActivityListing(activity){
  
    $("#allActivities").before(
      "<li class='collection-item' id='deviceListing-" + deviceId + "'>" +
        "<div class='row'>" +
          "<div class='col s9 m9 l9'>" +
            "From Device: " + activity["deviceId"] +
            "</br>Date of Activity: " + activity["date"] +
            "</br>Duration: " + activity["duration"] +
            "</br>Calories: " + activity["calories"] +
            "</br>Temperature: " + activity["temperature"] +
            "</br>Humidity: " + activity["humidity"] +
            "</br>GPS: " + addGPSTogether(activity["GPS"]) + 
          "</div>" +

        "</div>" +
      "</li>"
    );
  }
  
function addAllListing(Activities){
  for(var activity in Activities){
    addActivityListing(activity);
  }
}
  
  function getActivities(){
  $.ajax({
          url: '/activities/all',
          type: 'POST',
          headers: { 'x-auth': window.localStorage.getItem("authToken") },
          contentType: 'application/json'
         })
         .done(function (data, textStatus, jqXHR) {
           addAllListing(data["activities"])

         })
         .fail(function(jqXHR, textStatus, errorThrown) {
           let response = JSON.parse(jqXHR.responseText);
           $("#error").html("Error: " + response.message);
           $("#error").show();
         });

}
