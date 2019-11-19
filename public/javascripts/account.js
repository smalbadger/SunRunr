function sendReqForAccountInfo() {
  $.ajax({
    url: '/users/account',
    type: 'GET',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    dataType: 'json'
  })
    .done(accountInfoSuccess)
    .fail(accountInfoError);
}

function addDeviceListing(deviceId, apiKey){
  $("#addDeviceForm").before(
    "<li class='collection-item' id='deviceListing-" + deviceId + "'>ID: " +
      deviceId + ", APIKEY: " + apiKey +
      " <button id='ping-" + deviceId + "' class='waves-effect waves-light btn'>Ping</button> " +
      " <button id='replace-" + deviceId + "' class='waves-effect waves-light btn'>Replace</button> " +
      " <button id='remove-" + deviceId + "' class='waves-effect waves-light btn'>Remove</button> " +
    "</li>" +
    "<li class='collection-item' id='replaceDeviceForm-" + deviceId + "'>" +
      "<label for='deviceId-" + deviceId + "'>New Device ID:</label>" +
      "<input type='text' id='deviceId-" + deviceId +"' name='newDeviceId' col='30'>" +
      "<button id='replaceDevice-" + deviceId + "' class='waves-effect waves-light btn'>Replace</button>" +
      "<button id='cancel-" + deviceId + "' class='waves-effect waves-light btn'>Cancel</button>" +
    "</li>"
  );

  $("#ping-"+deviceId).click(function(event) {
    pingDevice(deviceId);
  });

  $("#replace-"+deviceId).click(function(event) {
    showReplaceDeviceForm(deviceId);
  });

  $("#cancel-"+deviceId).click(function(event){
    hideReplaceDeviceForm(deviceId);
  });

  $("#remove-"+deviceId).click(function(event) {
    removeDevice(deviceId);
  });

  hideReplaceDeviceForm(deviceId)
}

function removeDeviceListing(deviceId){
  $("#replaceDeviceForm-"+deviceId).slideUp()
  $("#deviceListing-"+deviceId).slideUp()
  window.setTimeout(()->{
    $("#replaceDeviceForm-"+deviceId).remove();
    $("#deviceListing-"+deviceId).remove();
  }, 200);
}

function accountInfoSuccess(data, textSatus, jqXHR) {
  $("#email").html(data.email);
  $("#fullName").html(data.fullName);
  $("#lastAccess").html(data.lastAccess);
  $("#main").show();

  // Add the devices to the list before the list item for the add device button (link)
  for (var device of data.devices) {
    addDeviceListing(device.deviceId, device.apikey);
  }
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

// Registers the specified device with the server.
function registerDevice() {
  $.ajax({
    url: '/devices/register',
    type: 'POST',
    headers: { 'x-auth': window.localStorage.getItem("authToken") },
    contentType: 'application/json',
    data: JSON.stringify({ deviceId: $("#deviceId").val() }),
    dataType: 'json'
   })
   .done(function (data, textStatus, jqXHR) {
     addDeviceListing($("#deviceId").val(), data["apikey"])
   })
   .fail(function(jqXHR, textStatus, errorThrown) {
     let response = JSON.parse(jqXHR.responseText);
     $("#error").html("Error: " + response.message);
     $("#error").show();
   });
}

function showReplaceDeviceForm(id){
  $("#deviceId-" + id).val("");
  $("#replace-" + id).hide();
  $("#replaceDeviceForm-"+id).slideDown();
}

function hideReplaceDeviceForm(id){
  $("#replace-" + id).show();
  $("#replaceDeviceForm-" + id).slideUp();
  $("#error").hide();
}

function removeDevice(deviceId){
  $.ajax({
       url: '/devices/remove/'+deviceId,
       type: 'DELETE',
       headers: { 'x-auth':  window.localStorage.getItem("authToken") },
       data: {},
       contentType: 'application/json',
       responseType: 'json',
       success: function (data, textStatus, jqXHR) {
           console.log("Device removed from account:" + deviceId);
           removeDeviceListing(deviceId);
       },
       error: function(jqXHR, textStatus, errorThrown) {
           var response = JSON.parse(jqXHR.responseText);
           $("#error").html("Error: " + response.message);
           $("#error").show();
       }
   });
}

function pingDevice(deviceId) {
   $.ajax({
        url: '/devices/ping',
        type: 'POST',
        headers: { 'x-auth': window.localStorage.getItem("authToken") },
        data: { 'deviceId': deviceId },
        responseType: 'json',
        success: function (data, textStatus, jqXHR) {
            console.log("Pinged.");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var response = JSON.parse(jqXHR.responseText);
            $("#error").html("Error: " + response.message);
            $("#error").show();
        }
    });
}

// Show add device form and hide the add device button (really a link)
function showAddDeviceForm() {
  $("#deviceId").val("");        // Clear the input for the device ID
  $("#addDeviceControl").hide();   // Hide the add device link
  $("#addDeviceForm").slideDown();  // Show the add device form
}

// Hides the add device form and shows the add device button (link)
function hideAddDeviceForm() {
  $("#addDeviceControl").show();  // Hide the add device link
  $("#addDeviceForm").slideUp();  // Show the add device form
  $("#error").hide();
}

// Handle authentication on page load
$(function() {
  // If there's no authToken stored, redirect user to
  // the sign-in page (which is userLogin.html)
  if (!window.localStorage.getItem("authToken")) {
    window.location.replace("userLogin.html");
  }
  else {
    sendReqForAccountInfo();
  }

  // Register event listeners
  $("#addDevice").click(showAddDeviceForm);
  $("#registerDevice").click(registerDevice);
  $("#cancel").click(hideAddDeviceForm);
});
