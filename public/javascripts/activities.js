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
    console.log(JSON.stringify(data.activities[i].activity));
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

  // Edit new activity node to contain the data for the specific activity
  newActivity.attr("id", activity._id)

  dateTag = newActivity.find("#temp-date")
  dateTag.attr("id", activity._id + "-date")
  dateTag.text(activity.date)

  durationTag = newActivity.find("#temp-activity-duration")
  durationTag.attr("id", activity._id + "-activity-duration")
  durationTag.text(activity.duration.toString())

  typeTag = newActivity.find("#temp-activity-type")
  typeTag.attr("id", activity._id + "-activity-type")
  // TODO: set activity type

  activityContent = newActivity.find("#temp-activity-content");
  activityContent.attr("id", activity._id+"-activity-content");
  activityContent.hide();

  moreBtn = newActivity.find("#temp-btn-more");
  moreBtn.attr("id", activity._id+"-btn-more");
  moreBtn.click(function(){
    //The id of the current activity is found and set as the gobal currActivityID
    selectedActivityID = this.id.slice(0, this.id.length-("-btn-more".length));
    $("#"+selectedActivityID+"-btn-more").hide();
    $("#"+selectedActivityID+"-btn-less").show();

    if (currActivityID == selectedActivityID) {return}
    currActivityID = selectedActivityID;

    //The details of the current activity are shown
    getByCurrId("activity-content").slideDown();
    showMap();

    //TODO: All other activities are collapsed
  })

  lessBtn = newActivity.find("#temp-btn-less");
  lessBtn.attr("id", activity._id+"-btn-less");
  lessBtn.hide();
  lessBtn.click(function(){
    getByCurrId("btn-more").show();
    getByCurrId("btn-less").hide();
    getByCurrId("activity-content").slideUp();
    currActivityID = null;
  })

  mapBtn = newActivity.find("#temp-mapBtn");
  mapBtn.attr("id", activity._id+"-mapBtn");
  mapBtn.click(showMap);

  speedBtn = newActivity.find("#temp-speedBtn");
  speedBtn.attr("id", activity._id+"-speedBtn");
  speedBtn.click(showSpeedGraph);

  uvBtn = newActivity.find("#temp-uvBtn");
  uvBtn.attr("id", activity._id+"-uvBtn");
  uvBtn.click(showUVGraph);

  newActivity.find("#temp-activity-map").attr("id", activity._id+"-activity-map");
  newActivity.find("#temp-speed-graph").attr("id", activity._id+"-speed-graph");
  newActivity.find("#temp-uv-graph").attr("id", activity._id+"-uv-graph");
  newActivity.find("#temp-btn-box").attr("id", activity._id+"-btn-box");

  uv = 0; //TODO: get total uv exposure
  uvTag = newActivity.find("#temp-temp-uv")
  uvTag.attr("id", activity._id+"-uv");
  uvTag.text(uv)

  temp = 0; //TODO: Get Temperature
  tempTag = newActivity.find("#temp-temp");
  tempTag.attr("id", activity._id+"-temp");
  tempTag.text(temp.toString() + "&degF")

  humidity = 0; //TODO: Get humidity
  humidTag = newActivity.find("#temp-humidity");
  humidTag.attr("id", activity._id+"-humidity");
  humidTag.text(humidity.toString() + "%")

  calories = 0; //TODO: calculate calories
  calTag = newActivity.find("#temp-calories");
  calTag.attr("id", activity._id+"-calories");
  calTag.text(calories.toString() + " cals burned");

  console.log(newActivity.html());

  $("#main_").append(newActivity);
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
    $("#temp").hide();
    getActivities();
  }
});

////////////////////////////////////////////////////////////////////////////////
//  GRAPHING CODE
////////////////////////////////////////////////////////////////////////////////
function lineGraph(targetID, data, xLabel, yLabel, title){
  var chart = new CanvasJS.Chart(targetID, {
    animationEnabled: true,
    backgroundColor: "#546E7A",
    theme: "dark2",
    title:{
      text: title
    },
    axisY:{
    	includeZero: false
    },
    data: [{
  		type: "line",
      lineColor: "red",
  		dataPoints: data
    }]
  });
  chart.render();
}
