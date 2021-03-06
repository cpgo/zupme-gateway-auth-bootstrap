(function () {
  'use strict';

  var conf = company.utils.getConfig(),
    url = company.utils.getUrlParams(),
    auth = company.utils.getCookieAsObject(conf.cookieName),
    oauthApiUrl = conf.login.entrypointUrl + conf.login.apiPath + conf.login.apiVersionPath + '/_oauth',
    application, authorizedScopes, appQueryString;

  function initialize() {
    if (!auth) {
      return company.utils.goToLoginPage();
    }

    createApplicationQueryString();
    loadApplicationAndScopes().done(renderPage).fail(showUnexpectedError);
    bindButtons();
  }

  function createApplicationQueryString() {
    appQueryString = !url.developer ?
      'gw-app-key=' + url.client_id :
      'gw-dev-app-key=' + url.client_id;
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
    return $.get(oauthApiUrl + '/application?' + appQueryString);
  }

  function loadAuthorizedScopes() {
    return $.get(oauthApiUrl + '/user-scopes?uid=' + auth.uid + '&' + appQueryString);
  }

  function renderPage(appResponse, scopesResponse) {
    application = appResponse[0];
    authorizedScopes = scopesResponse[0].scopes;
    verifyCallbackUrl(application.callbackUrls);
    verifyRequiredScopes(_.map(application.scopes, 'name'));
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
    var requiredScopes = url.scope.split(',');
    return _.map(_.difference(requiredScopes, authorizedScopes), buildFullScope);
  }

  function buildFullScope(scopeName) {
    return { name: scopeName, description: _.find(application.scopes, { name: scopeName }).description };
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
    company.utils.showErrorPage();
  }

  function allow() {
    grantPermissions()
      .done(handleTokens)
      .fail(showUnexpectedError);
  }

  function getPath() {
    return "/authorize";
  }

  function getAuthDataByResponseType(response_type) {
    var data = {
      token: {
        grantToken: auth.grantToken,
        scope: url.scope,
        responseType: 'token'
      },
      code: {
        grantToken: auth.grantToken,
        scope: url.scope,
        responseType: 'code'
      }
    };
    return data[response_type];
  }

  function grantPermissions() {
    var data = getAuthDataByResponseType(url.response_type);
    var apiUrl = oauthApiUrl + getPath();
    return $.post(apiUrl + '?' + appQueryString, data);
  }

  function handleTokens(data, statusText, xhr) {
    replaceGrantToken(xhr.getResponseHeader('x-grant-token'), xhr.getResponseHeader('x-grant-token-expiry'));
    data.username = auth.username;
    goToCallbackUrl(data);
  }

  function goToCallbackUrl(urlParams) {
    window.location = url.redirect_uri + '?' + company.utils.encodeObjectToUrl(urlParams);
  }

  function replaceGrantToken(newGrantToken, expiresInSeconds) {
    auth.grantToken = newGrantToken;
    company.utils.writeObjectAsCookie(conf.cookieName, auth, expiresInSeconds);
  }

  function isCallbackUrlValid(validDomains) {
    return _.find(validDomains, function (domain) {
      var domainWithEndingSlash = domain.replace(/([^\/])$/, '$1/'),
        domainWithEndingPortSymbol = domain.replace(/([^:])$/, '$1:');

      return url.redirect_uri === domain || url.redirect_uri.match('^' + domainWithEndingSlash) || url.redirect_uri.match('^' + domainWithEndingPortSymbol);
    });
  }

  function verifyCallbackUrl(validDomains) {
    if (!isCallbackUrlValid(validDomains)) {
      showUnexpectedError();
      throw 'Invalid callback URL. Operation was cancelled due to lack of security.';
    }
  }

  function verifyRequiredScopes(validScopesNames) {
    var requiredScopesNames = url.scope.split(' ');
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
} ());
