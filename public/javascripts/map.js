
// Initialize and add a map that shows all the users within a certain radius
//
function pin_point_users(embedID, numDays, numMiles) {

  //TODO: Get all activity locations within the past numDays and within the numMiles radius.

  //TODO: Calculate center of all activities
  var center = {lat: 32.222607, lng: -110.974709}; //This is a placeholder

  var map = new google.maps.Map(
      document.getElementById(embedID), {zoom: 4, center: center});

  //TODO: Make a marker for each activity
  var marker = new google.maps.Marker({position: center, map: map});

}

function map_out_path(embedID, coordinates){
  center = {lat:0, lng:0}
  for(let i=0; i<coordinates.length; i++){
    center['lat'] += coordinates[i]['lat']
    center['lng'] += coordinates[i]['lng']
  }
  center['lat'] /= coordinates.length
  center['lng'] /= coordinates.length

  var map = new google.maps.Map(document.getElementById(embedID), {
    zoom: 3,
    center: center,
    mapTypeId: 'terrain'
  });

  var path = new google.maps.Polyline({
    path: coordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  path.setMap(map);
}
