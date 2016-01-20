(function () {
  'use strict';

  if (!company.oauth.isAuthenticated()) {
    window.location = 'login.html';
  } else {
    $('#user-data').html(JSON.stringify(company.oauth.getAuthenticationData()));
    $('body').show();
  }

  $('#logout').click(function () {
    company.oauth.logout();
    window.location = 'login.html';
  });
}());