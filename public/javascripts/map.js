
// Initialize and add a map that shows all the users within a certain radius
//
function pin_point_users(embedID, numDays, numMiles, lat, lng) {

  $.ajax({
    url: '/activity/allAct/'+lat+'/'+lng+'/'+numMiles,
    type: 'GET',
    dataType: 'json'
  })
  .done(function (data, textSatus, jqXHR) {
    var center = {lat: lat, lng: lng}; //This is a placeholder

    var map = new google.maps.Map(
        document.getElementById(embedID), {zoom: 4, center: center});

    console.log(data)
    var marker = new google.maps.Marker({position: center, map: map});
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error: "+testStatus.message)
  });
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
