(function () {
  'use strict';

  var conf = company.config;

  function initialize() {
    if (isAuthenticated()) {
      goToGrantPermissionsPage();
      return;
    }
    $('form').submit(onSubmit);
  }

  function isAuthenticated() {
    return !!company.utils.getCookieAsObject(conf.cookieName);
  }

  function onSubmit() {
    login({
      username: $('#username').val(),
      password: $('#password').val()
    });
    return false;
  }

  function login(data) {
    $.post(conf.apiUrl + '/login', JSON.stringify(data))
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
    company.utils.writeObjectAsCookie(conf.cookieName, data, 7);
    goToGrantPermissionsPage();
  }

  function goToGrantPermissionsPage() {
    window.location = 'grant-permissions.html' + location.search;
  }

  function isLoginPage() {
    return $('.login-page').length;
  }

  if (isLoginPage()) {
    initialize();
  }
}());