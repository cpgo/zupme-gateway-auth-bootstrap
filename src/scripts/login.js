(function () {
  'use strict';

  var LOGIN_URL = 'http://localhost:8882/login',
      GRANT_PERMISSIONS_PAGE = 'grant-permissions.html',
      AUTHENTICATION_COOKIE_NAME = 'company_authentication';

  function initialize() {
    if (isAlreadyLoggedIn()) {
      goToGrantPermissionsPage();
      return;
    }
    $('form').submit(onSubmit);
  }

  function isAlreadyLoggedIn() {
    return !!company.utils.getCookieAsObject(AUTHENTICATION_COOKIE_NAME);
  }

  function onSubmit() {
    login({
      username: $('#username').val(),
      password: $('#password').val()
    });
    return false;
  }

  function login(data) {
    $.post(LOGIN_URL, JSON.stringify(data))
      .done(afterLogin)
      .fail(showErrors);
  }

  function showErrors(xhr) {
    var messages = xhr.responseJSON ? xhr.responseJSON.messages : [],
        message = messages[0] || 'An unexpected error occured. Please, try again.';

    $('.errors').html(message);
    $('#password').val('');
  }

  function afterLogin(data) {
    company.utils.writeObjectAsCookie(AUTHENTICATION_COOKIE_NAME, data, 7);
    goToGrantPermissionsPage();
  }

  function goToGrantPermissionsPage() {
    window.location = GRANT_PERMISSIONS_PAGE + location.search;
  }

  initialize();
}());