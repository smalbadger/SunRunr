  function getActivities(){
  $.ajax({
          url: '/activity/all',
          type: 'GET',
          headers: { 'x-auth': window.localStorage.getItem("authToken") },
          dataType: 'json'
         })
         .done(accountInfoSuccess)
    
         .fail(accountInfoError);

}


function accountInfoError(jqXHR, textStatus, errorThrown) {
  // If authentication error, delete the authToken
  // redirect user to sign-in page (which is userLogin.html)
  if( jqXHR.status === 401 ) {
    window.localStorage.removeItem("authToken");
    window.location.replace("userLogin.html");
  }
  else {
    $("#error").html("Error: " + status.message);
    $("#error").show();
  }
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  console.log("accountInfoSuccess reached");
  console.log(data);
  // Add the devices to the list before the list item for the add device button (link)
  for(var i = 0; i < data.Activities.length; i++){
    console.log(data.Activities[i]);
    addActivityListing(data.Activities[i]);
  }
} 

function addGPSTogether(GPS){
  console.log("addGPSTogether reached");
var str;
  for(var gps in GPS){
    str += "</br>lon: " + gps.lon + " lat: " + gps.lat + " speed: " + gps.speed + " uv: " + gps.uv;
  }
  console.log(str);
  return str;
}

function addActivityListing(activity){
  console.log("addActivityListing reached. Activity is:");
  console.log(activity);
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
  
$(function() {
  // If there's no authToken stored, redirect user to
  // the sign-in page (which is userLogin.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("userLogin.html");
  }
  else {
    getActivities();
  }

});
