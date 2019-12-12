var currActivityID = null

function getCurrId(id){
  return currActivityID+"-"+id;
}

function getByCurrId(id){
  if (currActivityID != null){
    return $('#'+getCurrId(id));
  }
  else{
    return $("#"+id);
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
var str = "";
  for(var i = 0; i < GPS.length; i++){
    str += "</br>lon: " + GPS[i].lon + " lat: " + GPS[i].lat + " speed: " + GPS[i].speed + " uv: " + GPS[i].uv;
  }
  return str;
}

function addActivityListing(activity){

  var activityTemplate = $(".activity-template")
  var newActivity = activityTemplate.clone()

  //TODO: edit new activity node to contain the data for the specific activity

  activityTemplate.before(newActivity)


    // $("#allActivities").before(
    //   "<li class='collection-item' id='activityListing-" + activity._id + "'>" +
    //     "<div class='row'>" +
    //       "<div class='col s9 m9 l9'>" +
    //         "</br>Date of Activity: " + activity.date +
    //         "</br>Duration: " + activity.duration + " ms" +
    //         "</br>Calories: " + activity.calories +
    //         "</br>Temperature: " + activity.temperature +
    //         "</br>Humidity: " + activity.humidity +
    //         "</br>GPS: " + addGPSTogether(activity.GPS) +
    //       "</div>" +
    //     "</div>" +
    //   "</li>"
    // );
  }



function showMap(){
  getByCurrId("activity-map").slideDown()
  getByCurrId("speed-graph").slideUp()
  getByCurrId("uv-graph").slideUp()

  // Create callback function for creating the map
  window.gMapsCallback = function(){
      pathData = {}
      console.log(getCurrId("activity-map"))
      map_out_path(getCurrId("activity-map"), pathData);
  }

  // remove any google maps API script tags
  googleMapsAPI = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDTguMstpVrOCikPMA2DSWFw4wFE-8NtM0&callback=gMapsCallback"
  $('script[src="' + googleMapsAPI + '"]').remove();

  // Create the script element that links to the google maps API
  var script_tag = document.createElement('script');
  script_tag.setAttribute("type","text/javascript");
  script_tag.setAttribute("src", googleMapsAPI);
  (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}

function showSpeedGraph(){
  console.log("Showing speed graph for activity " + currActivityID);

  getByCurrId("activity-map").slideUp()
  getByCurrId("speed-graph").slideDown()
  getByCurrId("uv-graph").slideUp()

  //TODO: make query to get actual speed data for this activity
  speedData = [{y:0}, {y:11}, {y:12}, {y:10}, {y:12}, {y:10}, {y:9}, {y:7}, {y:12}, {y:6}, {y:7}, {y:8}, {y:7}, {y:7}]

  lineGraph(getCurrId("speed-graph"), speedData, "Time", "Speed (MPH)", "Activity Speed");
}

function showUVGraph(){
  console.log("Showing UV graph for activity " + currActivityID);

  getByCurrId("activity-map").slideUp()
  getByCurrId("speed-graph").slideUp()
  getByCurrId("uv-graph").slideDown()

  //TODO: make query to get actual UV data for this activity
  uvData = [{y:2.2}, {y:2}, {y:2.1}, {y:1.9}, {y:2.3}, {y:2.4}, {y:2}, {y:1.8}, {y:1}, {y:1.1}, {y:1.2}, {y:1.1}, {y:2.0}, {y:1.5}]

  lineGraph(getCurrId("uv-graph"), uvData, "Time", "UV Strength", "UV Exposure");
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

window.onload = function () {
  $(".activity-content").hide()
  $(".activity-dropup-btn").hide()

  $(".activity-dropdown-btn").click(function(){

    this.hide()

    //The id of the current activity is found and set as the gobal currActivityID
    selectedActivityID = this.id.slice(0, this.id.length-("-btn-more".length));
    if (currActivityID == selectedActivityID) {return}
    currActivityID = selectedActivityID;

    //The details of the current activity are shown
    $(".activity-content").show();
    getByCurrId("mapBtn").click(showMap)
    getByCurrId("speedBtn").click(showSpeedGraph)
    getByCurrId("uvBtn").click(showUVGraph)
    showMap();

    //TODO: All other activities are collapsed
  })

  $(".activity-dropup-btn").click(function(){
    $(".activity-dropup-btn").hide()
    $(".activity-dropdown-btn").show()
    $(".activity-content").slideUp();
    currActivityID = null
  })
}

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
  		dataPoints: data
    }]
  });
  chart.render();
}
