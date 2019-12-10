
// Initialize and add a map that shows all the users within a certain radius
//
function pin_point_users(var embedID, var numDays, var numMiles) {

  //TODO: Get all activity locations within the past numDays and within the numMiles radius.

  //TODO: Calculate center of all activities
  var center = {lat: 32.2226, lng: 110.9747}; //This is a placeholder

  // The map, centered at Uluru
  var map = new google.maps.Map(
      document.getElementById(embedID), {zoom: 4, center: center});
  // The marker, positioned at Uluru
  var marker = new google.maps.Marker({position: center, map: map});

}
