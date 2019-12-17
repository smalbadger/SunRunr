function createSummary(){
  $.ajax({
    url: '/activity/all',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
  .done(function (data, textSatus, jqXHR) {
    // Add the devices to the list before the list item for the add device button (link)
    activityData = []
    for(var i = 0; i < data.activities.length; i++){
      activityData.push(data.activities[i].activity);
    }
    summarize(activityData);
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Failed to load summary");
  });
}
