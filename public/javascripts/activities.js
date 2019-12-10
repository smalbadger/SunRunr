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
function lineGraph(targetID, data, xLabel, yLabel, title){
  var chart = new CanvasJS.Chart(targetID, {
    animationEnabled: true,
    theme: "light2",
    title:{
      text: title
    },
    axisY:{
    	includeZero: true
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


window.onload = function () {
  speedData = [
    {y:0},
    {y:11},
    {y:12},
    {y:10},
    {y:12},
    {y:10},
    {y:9},
    {y:7},
    {y:12},
    {y:6},
    {y:7},
    {y:8},
    {y:7},
    {y:7},
  ]
  uvData = [
    {y:2.2},
    {y:2},
    {y:2.1},
    {y:1.9},
    {y:2.3},
    {y:2.4},
    {y:2},
    {y:1.8},
    {y:1},
    {y:1.1},
    {y:1.2},
    {y:1.1},
    {y:2.0},
    {y:1.5},
  ]
  lineGraph("speed-graph", speedData, "Time", "Speed (MPH)", "Activity Speed");
  lineGraph("uv-graph", uvData, "Time", "UV Strength", "UV Exposure");
}
