(function () {
  'use strict';

  var LOGIN_URL = 'http://localhost:8882/login';

  function initialize() {
    $('form').submit(onSubmit);
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
      .done(goToGrantPermissionsPage)
      .fail(showErrors);
  }

  function showErrors(xhr) {
    var messages = xhr.responseJSON ? xhr.responseJSON.messages : [],
        message = messages[0] || 'An unexpected error occured. Please, try again.';

    $('.errors').html(message);
    $('#password').val('');
  }

  function goToGrantPermissionsPage() {
    window.location = 'grant-permissions.html';
  }

  initialize();
}());