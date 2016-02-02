(function () {
  'use strict';

  var conf = company.config,
      url = company.utils.getUrlParams(),
      auth = company.utils.getCookieAsObject(conf.cookieName),
      application, authorizedScopes;

  function initialize() {
    if (!auth) {
      return goToLoginPage();
    }

    loadApplicationAndScopes();
    bindButtons();
  }

  function goToLoginPage() {
    location.href = 'login.html' + location.search;
  }

  function loadApplicationAndScopes() {
    $.when(loadApplication(), loadAuthorizedScopes())
      .done(renderApplicationAndScopes)
      .fail(showUnexpectedError);
  }

  function bindButtons() {
    $('#allow').click(allow);
    $('#cancel').click(function () {
      window.close();
    });
  }

  function loadApplication() {
    return $.get(conf.login.entrypointUrl + '/applications/' + url.applicationKey);
  }

  function loadAuthorizedScopes() {
    return $.ajax({
      type: 'get',
      url: conf.login.entrypointUrl + '/applications/' + url.applicationKey + '/granted',
      headers: {'x-grant-token': auth.grantToken}
    });
  }

  function renderApplicationAndScopes(appResponse, scopesResponse) {
    application = appResponse[0];
    authorizedScopes = scopesResponse[0];
    $('#application-name').html(application.name);
    handleScopes();
  }

  function handleScopes() {
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
    var tokenUrl = conf.login.entrypointUrl + conf.login.apiPath + conf.login.apiVersionPath + '/_oauth/authorization-code';

    return $.post(tokenUrl, {
      grantToken: auth.grantToken,
      uid: auth.uid,
      scopes: url.scopes,
      grantType: url.grantType
    });
  }

  function handleTokens(data) {
    replaceGrantToken(data.grantToken);
    verifyCallbackUrl(data.callbackUris);
    goToCallbackUrl(data);
  }

  function goToCallbackUrl(data) {
    var navigateTo = url.callbackUrl +
      '?uid=' + encodeURIComponent(auth.uid) +
      '&username=' + encodeURIComponent(auth.username);
    if (data.accessToken) {
      navigateTo += '&accessToken=' + encodeURIComponent(data.accessToken);
    }
    if (data.authCode) {
      navigateTo += '&authCode=' + encodeURIComponent(data.authCode);
    }
    window.location = navigateTo;
  }

  function replaceGrantToken(newGrantToken) {
    auth.grantToken = newGrantToken;
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
