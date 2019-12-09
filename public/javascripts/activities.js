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
  // Add the devices to the list before the list item for the add device button (link)
  for(var i = 0; i < data.activities.length; i++){
    console.log(data.activities[i].activity);
    addActivityListing(data.activities[i].activity);
  }
}

function addGPSTogether(GPS){
  console.log("addGPSTogether reached");
  console.log(GPS);
var str = "";
  for(var i = 0; i < GPS.length; i++){
    str += "</br>lon: " + GPS[i].lon + " lat: " + GPS[i].lat + " speed: " + GPS[i].speed + " uv: " + GPS[i].uv;
  }
  console.log(str);
  return str;
}

function addActivityListing(activity){
    $("#allActivities").before(
      "<li class='collection-item' id='activityListing-" + activity._id + "'>" +
        "<div class='row'>" +
          "<div class='col s9 m9 l9'>" +
            "</br>Date of Activity: " + activity.date +
            "</br>Duration: " + activity.duration + " ms" +
            "</br>Calories: " + activity.calories +
            "</br>Temperature: " + activity.temperature +
            "</br>Humidity: " + activity.humidity +
            "</br>GPS: " + addGPSTogether(activity.GPS) +
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

////////////////////////////////////////////////////////////////////////////////
//  GRAPHING CODE
////////////////////////////////////////////////////////////////////////////////
window.onload = function () {

var chart = new CanvasJS.Chart("chartContainer", {
  animationEnabled: true,
  theme: "light2",
  title:{
    text: "Simple Line Chart"
  },
  axisY:{
  	includeZero: false
  },
  data: [{
  		type: "line",
  		dataPoints: [
  			{ y: 450 },
  			{ y: 414},
  			{ y: 520, indexLabel: "highest", markerColor: "red", markerType: "triangle" },
  			{ y: 460 },
  			{ y: 450 },
  			{ y: 500 },
  			{ y: 480 },
  			{ y: 480 },
  			{ y: 410 , indexLabel: "lowest",markerColor: "DarkSlateGrey", markerType: "cross" },
  			{ y: 500 },
  			{ y: 480 },
  			{ y: 510 }
  		]
  	}]
  });
  chart.render();
}
