var activityData = null
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
  activityData = {}
  for(var i = 0; i < data.activities.length; i++){
    console.log(JSON.stringify(data.activities[i].activity));
    addActivityListing(data.activities[i].activity);
    activityData[data.activities[i].activity._id] = data.activities[i].activity.GPS;
  }
}

function addGPSTogether(GPS){
var str = "";
  for(var i = 0; i < GPS.length; i++){
    str += "</br>lon: " + GPS[i].lon + " lat: " + GPS[i].lat + " speed: " + GPS[i].speed + " uv: " + GPS[i].uv;
  }
  return str;
}

function prettyTime(ms){
  hours = Math.floor(ms/3600000);
  ms -= hours*360000;
  mins = Math.floor(ms/60000);
  ms -= mins*60000;
  secs = Math.floor(ms/1000);
  ms -= secs*1000;

  timeStr = "";
  if (hours > 0){
    timeStr += `${hours}h `;
  }
  if (mins > 0){
    timeStr += `${mins}m `;
  }
  if (secs > 0){
    timeStr += `${secs}s `;
  }

  if (timeStr == ""){
    timeStr = "0s"
  }

  return timeStr.trim();
}

function collapseActivity(activity){
  $("#" + activity + "-activity-content").hide();
  $("#" + activity + "-btn-more").show();
  $("#" + activity + "-btn-less").hide();
}

function addActivityListing(activity){
  var activityTemplate = $("#temp");
  var newActivity = activityTemplate.clone();
  newActivity.removeClass("activity-template");
  newActivity.show();

  // Edit new activity node to contain the data for the specific activity
  newActivity.attr("id", activity._id)

  dateTag = newActivity.find("#temp-date")
  dateTag.attr("id", activity._id + "-date")
  dateTag.text(activity.date.split("T")[0])

  durationTag = newActivity.find("#temp-activity-duration")
  durationTag.attr("id", activity._id + "-activity-duration")
  durationTag.text(prettyTime(activity.duration))

  typeSelect = newActivity.find("#temp-activity-type-selection")
  typeSelect.attr("id", activity._id + "-activity-type-selection")
  typeSelect.attr("data-target", activity._id + '-activity-type-dropdown')
  typeSelect.click(function(){
    selectedActivityID = this.id.split("-")[0];
    $(selectedActivityID + '-activity-type-dropdown').show();
  })

  typeDropDown = newActivity.find('#temp-activity-type-dropdown')
  typeDropDown.attr("id", activity._id + "-activity-type-dropdown")

  typeTag = newActivity.find(".dropdown-trigger")
  typeTag.attr("id", activity._id + "-activity-type-selection")
  typeTag.text(activity.aType)

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

    //All other activities are collapsed
    $("#"+currActivityID).siblings().each(function (index, value) {
      collapseActivity($(this).attr('id'));
    });
  });

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

  uv = 0;
  for (var i=0; i<activity.GPS.length; i++){
    uv += activity.GPS[i].uv;
  }
  uvTag = newActivity.find("#temp-uv")
  uvTag.attr("id", activity._id+"-uv");
  uvTag.html("<span>" + uv.toString() + " mW/cm<sup>2</sup></span>")

  if (activity.temperature != undefined){
    temp = activity.temperature * (9/5) - 459.67;
  }
  else {
    temp = 0;
  }
  tempTag = newActivity.find("#temp-temp");
  tempTag.attr("id", activity._id+"-temp");
  tempTag.html("<span>" + temp.toFixed(1) + "&#176; F</span>")

  if (activity.humidity != undefined){
    humidity = activity.humidity;
  }
  else {
    humidity = 0;
  }
  humidTag = newActivity.find("#temp-humidity");
  humidTag.attr("id", activity._id+"-humidity");
  humidTag.html("<span>" + humidity.toString() + "%</span>")

  calories = activity.calories.toFixed(0);
  calTag = newActivity.find("#temp-calories");
  calTag.attr("id", activity._id+"-calories");
  calTag.html("<span>" + calories.toString() + " cals burned</span>");

  $("#activities").append(newActivity);
  $('.modal').modal();
  $('.dropdown-trigger').dropdown();

  newActivity.find(".activity-type-select").click(function(){
    console.log("UPDATE ACTIVITY");
    updateActivityType($(this));
  })
}

function updateActivityType(selection){
  var selectedActivityID = selection.parent().parent().attr('id').split('-')[0]
  var type = selection.clone().children().remove().end().text();
  console.log(`Changing activity ${selectedActivityID} to type ${type}`)
  $.ajax({
    url: '/activity/updateType',
    type: 'PUT',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json',
    data: JSON.stringify({_id:selectedActivityID, aType:type}),
    dataType: 'json'
  })
  .done(function (data, textStatus, jqXHR) {
    window.location.reload(false)
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Update Failed")
    console.log(jqXHR)
    console.log(textStatus)
    console.log(errorThrown)
  });
}

function showMap(){
  getByCurrId("activity-map").slideDown()
  getByCurrId("speed-graph").slideUp()
  getByCurrId("uv-graph").slideUp()

  // Create callback function for creating the map
  window.gMapsCallback = function(){
      pathData = []
      for(var i=0; i<activityData[currActivityID].length; i++){
        pathData.push({lat:activityData[currActivityID][i].lat, lng:activityData[currActivityID][i].lon})
      }
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
  getByCurrId("activity-map").slideUp()
  getByCurrId("speed-graph").slideDown()
  getByCurrId("uv-graph").slideUp()

  //TODO: make query to get actual speed data for this activity
  speedData = []
  for(var i=0; i<activityData[currActivityID].length; i++){
    speedData.push({y:activityData[currActivityID][i].speed})
  }

  lineGraph(getCurrId("speed-graph"), speedData, "Time", "Speed (MPH)", "Activity Speed");
}

function showUVGraph(){
  getByCurrId("activity-map").slideUp()
  getByCurrId("speed-graph").slideUp()
  getByCurrId("uv-graph").slideDown()

  //TODO: make query to get actual UV data for this activity
  uvData = []
  for(var i=0; i<activityData[currActivityID].length; i++){
    if (activityData[currActivityID][i].uv == 65535){
      activityData[currActivityID][i].uv = -1;
    }
    uvData.push({y:activityData[currActivityID][i].uv})
  }

  lineGraph(getCurrId("uv-graph"), uvData, "Time", "UV Strength", "UV Exposure");
}

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
