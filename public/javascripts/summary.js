function summarizeUser(activityData){

  totalDuration = 0;
  totalCalories = 0;
  totalUV = 0;
  for(let i=0; i<activityData.length; i++){

    //TODO: filter activities from the past 7 days

    totalDuration += activityData[i].duration;
    totalCalories += activityData[i].calories;
    for(let j=0; j<activityData[i].GPS.length; j++){
      if (activityData[i].GPS[j].uv != 65535){
        totalUV += activityData[i].GPS[j].uv;
      }
    }
  }

  $("#total-duration").html(prettyTime(totalDuration));
  $("#total-calories").html(totalCalories.toFixed(0) + " Calories");
  $("#total-uv").html("<span>" + totalUV + " mW/cm<sup>2</sup></span>");
}

function summarizeAllUsers(lat, lng, radius){
  $.ajax({
    url: '/activity/allAct/'+lat+'/'+lng+'/'+radius,
    type: 'GET',
    dataType: 'json'
  })
  .done(function (data, textSatus, jqXHR) {

    $("#num-activities").text(data.activities.length.toString())

    console.log(data.activities)

    // organize activities into users
    users = {}
    for(activity of data.activities){
      if (!users.hasOwnProperty(activity.userEmail)){
        users[activity.userEmail] = [];
      }
      users[activity.userEmail].push(activity);
    }

    // calculate statistics

    var avgTotDist = 0
    var avgTotCals = 0
    var avgUV = 0
    for (var key in users){

      var totalDist = 0
      var totalCals = 0
      var totalUV = 0
      for (var activity of users[key]){
        for (var i=0; i<activity.GPS.length-1; i++){
          var p1 = activity.GPS[i]
          var p2 = activity.GPS[i+1]
          totalDist += milesBetween(p1.lat, p1.lon, p2.lat, p2.lon)
          totalUV += activity.GPS[i].uv
        }
        totalUV += activity.GPS[activity.GPS.length-1].uv
        totalCals += activity.calories
      }
      avgTotDist += totalDist
      avgTotCals += totalCals
      avgUV += totalUV
    }
    avgTotDist /= Object.keys(users).length
    avgTotCals /= Object.keys(users).length
    avgUV /= Object.keys(users).length

    $("#average-total-distance").text(avgTotDist.toFixed(2) + " miles");
    $("#average-total-calories").text(avgTotCals.toFixed(0) + " calories burned")
    $("#average-uv").html("<span>" + avgUV + " mW/cm<sup>2</sup></span>")

  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error: "+testStatus.message)
  });
}


function milesBetween(lat1, lon1, lat2, lon2){
  const metersPerMile = 1609.34;
  const R = 6371e3; // metres
  var phi1 = lat1 * Math.PI/180
  var phi2 = lat2 * Math.PI/180
  var deltaphi = (lat2-lat1) * Math.PI/180
  var deltalambda = (lon2-lon1) * Math.PI/180
  var a = Math.sin(deltaphi/2) * Math.sin(deltaphi/2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltalambda/2) * Math.sin(deltalambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var dist = R * c / metersPerMile;
  return dist;
}
