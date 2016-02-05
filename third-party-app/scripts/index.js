(function () {
  'use strict';

  function createAuthHeader() {
    var auth = company.oauth.getAuthenticationData();
    return 'Bearer ' + window.btoa(auth.uid + ':' + auth.accessToken);
  }

  if (!company.oauth.isAuthenticated()) {
    window.location = 'login.html';
  } else {
    $('#user-data').html(JSON.stringify(company.oauth.getAuthenticationData()));
    $('#auth-header').html(createAuthHeader());
    $('body').show();
  }

  $('#logout').click(function () {
    company.oauth.logout();
    window.location = 'login.html';
  });
}());
