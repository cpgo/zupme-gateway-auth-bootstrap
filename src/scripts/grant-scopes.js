(function () {
  'use strict';

  var conf = company.config,
      application, authorizedScopes, url, auth;

  function initialize() {
    if (!isAuthenticated()) {
      return goToLoginPage();
    }

    loadApplicationAndScopes();
    bindButtons();
  }

  function isAuthenticated() {
    return !!company.utils.getCookieAsObject(conf.cookieName);
  }

  function goToLoginPage() {
    location.href = 'login.html';
  }

  function loadApplicationAndScopes() {
    $.when(loadApplication, loadAuthorizedScopes)
      .done(renderApplicationAndScopes)
      .fail(showUnexpectedError);
  }

  function bindButtons() {
    $('#allow').click(allow);
    $('#cancel').click(window.close);
  }

  function loadApplication() {
    return $.get(conf.apiUrl + '/applications/' + url.appId);
  }

  function loadAuthorizedScopes() {
    return $.ajax({
      type: 'get',
      url: conf.apiUrl + '/applications/' + url.appId + '/granted',
      headers: {'x-grant-token': auth['grant_token']}
    });
  }

  function renderApplicationAndScopes(app, scopes) {
    application = app;
    authorizedScopes = scopes;
    $('#application-name').html(appData.name);
    handleScopes();
    $('.permissions-page').removeClass('hidden');
  }

  function handleScopes() {
    var scopesToAuthorize = getRequiredScopesWhereAccessWasNotGranted();
    if (!scopesToAuthorize.length) {
      return allow();
    }
    askForAuthorizationInScopes(scopesToAuthorize);
  }

  function getRequiredScopesWhereAccessWasNotGranted() {
    var requiredScopes = url.scopes.split(',');
    return _.map(_.difference(requiredScopes, authorizedScopes), buildFullScope);
  }

  function buildFullScope(scopeName) {
    return _.find(application.scopes, {name: scopeName});
  }

  function askForAuthorizationInScopes(scopes) {
    var model = $('#scope-model').remove(),
        list = $('.scope-box');

    _.forEach(scopes, function (scope) {
      renderScope(scope, model, list);
    });
  }

  function renderScope(scope, model, list) {
    var html = model.clone();
    html.find('.scope-name').html(scopes[i].name);
    html.find('.scope-description').html(scopes[i].description);
    list.append(html);
  }

  function showUnexpectedError() {
    company.utils.deleteCookie(conf.cookieName);
    window.location = 'error.html';
  }

  function allow() {
    grantPermissions()
      .done(handleTokens)
      .fail(showUnexpectedError);
  }

  function grantPermissions() {
    return $.ajax({
      type: 'post',
      url: conf.apiUrl + '/token',
      data: JSON.stringify({scopes: url.scopes.split(',')}),
      headers: {'x-grant-token': auth['grant_token']}
    });
  }

  function handleTokens(data) {
    replaceGrantToken(data['grant_token']);
    verifyCallbackUrl(data['callback_urls']);
    window.location = company.utils.getUrlParam('callbackUrl');
  }

  function replaceGrantToken(newGrantToken) {
    auth['grant_token'] = newGrantToken;
    company.utils.writeObjectAsCookie(conf.cookieName, auth, conf.cookieExpirationDays);
  }

  function verifyCallbackUrl(validUrls) {
    if (!_.includes(validUrls, url.callbackUrl)) {
      showUnexpectedError();
      throw 'Invalid callback URL. Operation was cancelled due to lack of security.';
    }
  }

  function isGrantScopesPage() {
    return $('.scopes-page').length;
  }

  if (isGrantScopesPage()) {
    initialize();
  }
}());
