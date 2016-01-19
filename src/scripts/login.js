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
    if (xhr.status !== 401) {
      return window.location = 'error.html';
    }
    $('.errors').html('Nome de usuário e/ou senha incorretos.');
    $('#password').val('');
  }

  function afterLogin(data) {
    company.utils.writeObjectAsCookie(conf.cookieName, data, conf.cookieExpirationDays);
    goToGrantPermissionsPage();
  }

  function goToGrantPermissionsPage() {
    window.location = 'grant-scopes.html' + location.search;
  }

  function isLoginPage() {
    return $('.login-page').length;
  }

  if (isLoginPage()) {
    initialize();
  }
}());