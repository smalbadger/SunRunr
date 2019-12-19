$(function() {
   $('.signout').click(function() {
      window.localStorage.removeItem('authToken');
      window.location = "userLogin.html";

      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
      console.log('User signed out.');
    });
   });
});
