(function () {
  'use strict';

  var conf = company.utils.getConfig(),
    url = company.utils.getUrlParams();

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

  function getQueryString() {
    return !url.developer ?
    '?gw-app-key=' + url.client_id :
    '?gw-dev-app-key=' + url.client_id;
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
      url: conf.login.entrypointUrl + conf.login.apiPath + conf.login.apiVersionPath + conf.login.resourcePath + getQueryString(),
      data: JSON.stringify(data),
      contentType: 'application/json'
    }).done(afterLogin).fail(showErrors);
  }

  function showErrors(xhr) {
    if (xhr.status !== 401) {
      company.utils.showErrorPage();
    }
    $('.errors').html('Nome de usuário e/ou senha incorretos.');
    $('#password').val('');
  }

  function afterLogin(data, statusText, xhr) {
    var loginResult = {
      username: $('#username').val(),
      uid: xhr.getResponseHeader('x-uid'),
      grantToken: xhr.getResponseHeader('x-grant-token')
    };
    company.utils.writeObjectAsCookie(conf.cookieName, loginResult, xhr.getResponseHeader('x-grant-token-expiry'));
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
