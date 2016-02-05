(function () {
  'use strict';

  var conf = company.config,
    url = company.utils.getUrlParams(),
    auth = company.utils.getCookieAsObject(conf.cookieName),
    oauthApiUrl = conf.login.entrypointUrl + conf.login.apiPath + conf.login.apiVersionPath + '/_oauth',
    application, authorizedScopes, applicationHeader;

  function initialize() {
    if (!auth) {
      return goToLoginPage();
    }

    createApplicationHeader();
    loadApplicationAndScopes().done(renderPage).fail(showUnexpectedError);
    bindButtons();
  }

  function goToLoginPage() {
    location.href = 'login.html' + location.search;
  }

  function createApplicationHeader() {
    applicationHeader = url.applicationKey ?
    {'x-application-key': url.applicationKey} :
    {'x-developer-application-key': url.developerApplicationKey};
  }

  function loadApplicationAndScopes() {
    return $.when(loadApplication(), loadAuthorizedScopes());
  }

  function bindButtons() {
    $('#allow').click(allow);
    $('#cancel').click(function () {
      window.close();
    });
  }

  function loadApplication() {
    return $.ajax({
      type: 'get',
      url: oauthApiUrl + '/application',
      headers: applicationHeader
    });
  }

  function loadAuthorizedScopes() {
    return $.ajax({
      type: 'get',
      url: oauthApiUrl + '/user-scopes?uid=' + auth.uid,
      headers: applicationHeader
    });
  }

  function renderPage(appResponse, scopesResponse) {
    application = appResponse[0];
    authorizedScopes = scopesResponse[0].scopes;
    verifyCallbackUrl(application.callbackUrls);
    verifyRequiredScopes(_.keys(application.scopes));
    renderApplication();
    renderScopes();
  }

  function renderApplication() {
    $('#application-name').html(application.name);
  }

  function renderScopes() {
    var scopesToAuthorize = getRequiredScopesWhereAccessWasNotGranted();
    if (!scopesToAuthorize.length) {
      return allow();
    }
    askForAuthorizationInScopes(scopesToAuthorize);
    $('.scopes-page').removeClass('hidden');
  }

  function getRequiredScopesWhereAccessWasNotGranted() {
    var requiredScopes = url.scopes.split(',');
    return _.map(_.difference(requiredScopes, authorizedScopes), buildFullScope);
  }

  function buildFullScope(scopeName) {
    return {name: scopeName, description: application.scopes[scopeName]};
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
    html.find('.scope-name').html(scope.name);
    html.find('.scope-description').html(scope.description);
    list.append(html);
  }

  function showUnexpectedError() {
    company.utils.deleteCookie(conf.cookieName);
    window.location = 'error.html' + location.search;
  }

  function allow() {
    grantPermissions()
      .done(handleTokens)
      .fail(showUnexpectedError);
  }

  function grantPermissions() {
    return $.ajax({
      url: oauthApiUrl + '/authorization-code',
      type: 'post',
      headers: applicationHeader,
      data: {
        grantToken: auth.grantToken,
        uid: auth.uid,
        scopes: url.scopes,
        grantType: url.grantType
      }
    });
  }

  function handleTokens(data, statusText, xhr) {
    replaceGrantToken(xhr.getResponseHeader('x-grant-token'), xhr.getResponseHeader('x-grant-token-expiry'));
    data.username = auth.username;
    goToCallbackUrl(data);
  }

  function goToCallbackUrl(urlParams) {
    window.location = url.callbackUrl + '?' + company.utils.encodeObjectToUrl(urlParams);
  }

  function replaceGrantToken(newGrantToken, expiresInSeconds) {
    auth.grantToken = newGrantToken;
    company.utils.writeObjectAsCookie(conf.cookieName, auth, expiresInSeconds);
  }

  function verifyCallbackUrl(validUrls) {
    if (!_.includes(validUrls, url.callbackUrl)) {
      showUnexpectedError();
      throw 'Invalid callback URL. Operation was cancelled due to lack of security.';
    }
  }

  function verifyRequiredScopes(validScopesNames) {
    var requiredScopesNames = url.scopes.split(',');
    var invalidRequiredScopes = _.difference(requiredScopesNames, validScopesNames);
    if (invalidRequiredScopes.length) {
      showUnexpectedError();
      throw 'Invalid scopes: ' + invalidRequiredScopes.join(', ');
    }
  }

  function isGrantScopesPage() {
    return $('.scopes-page').length;
  }

  if (isGrantScopesPage()) {
    initialize();
  }
}());
