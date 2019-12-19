$(function() {
   $('.signout').click(function() {
      window.localStorage.removeItem('authToken');
   });
});
