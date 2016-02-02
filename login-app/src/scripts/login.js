(function () {
  'use strict';

  var conf = company.config;

  function initialize() {
    if (isAuthenticated()) {
      goToGrantPermissionsPage();
      return;
    }
    $('form').submit(onSubmit);
    $('.login-page').removeClass('hidden');
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
    $.ajax({
      type: conf.login.httpMethod,
      url: conf.login.entrypointUrl + conf.login.apiPath + conf.login.apiVersionPath + conf.login.resourcePath,
      data: JSON.stringify(data)
    }).done(afterLogin).fail(showErrors);
  }

  function showErrors(xhr) {
    if (xhr.status !== 401) {
      return window.location = 'error.html' + location.search;
    }
    $('.errors').html('Nome de usuário e/ou senha incorretos.');
    $('#password').val('');
  }

  function afterLogin(data) {
    data.username = $('#username').val();
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