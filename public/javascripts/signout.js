$(function() {
   $('.signout').click(function() {
      window.localStorage.removeItem('authToken');

      try{
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          console.log('User signed out.');
        });
      } catch{
        GoogleAuth.signOut();
      }

      window.location = "userLogin.html";
   });
});
