function sendReqForAccountInfo() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(getActivities)
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
  
function accountInfoSuccess(data, textSatus, jqXHR) {
  // Add the devices to the list before the list item for the add device button (link)
  for(var activity in Activities){
    addActivityListing(activity);
  }
}  

  function getActivities(){
  $.ajax({
          url: '/activity/all',
          type: 'GET',
          headers: { 'x-auth': window.localStorage.getItem("authToken") },
          dataType: 'json'
         })
         .done(accountInfoSuccess)
    
         .fail(function(jqXHR, textStatus, errorThrown) {
           let response = JSON.parse(jqXHR.responseText);
           $("#error").html("Error: " + response.message);
           $("#error").show();
         });

}

$(function() {
  // If there's no authToken stored, redirect user to
  // the sign-in page (which is userLogin.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("userLogin.html");
  }
  else {
    sendReqForAccountInfo();
  }

});
