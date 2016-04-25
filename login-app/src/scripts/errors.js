(function () {
  'use strict';

  var count = 0;
  var foundErrorMsg;
  var error = _.template('Request Error: <%= msg %>');
  var MESSAGES = {
    'app.key.undefined': '"gw-app-key" or "gw-dev-app-key" must be defined. (query string)',
    'callbackUrl.undefined': '"callbackUrl" must be defined. (query string)',
    'grantType.undefined': '"grantType" must be defined. (query string)',
    'scopes.undefined': '"scopes" must be defined. (query string)',
    'check.login.data': 'Check if the data format is the same expected by endpoint'
  };

  function initialize(event, xhr, settings) {
    foundErrorMsg = loadErrorsCondition(settings);

    if (!foundErrorMsg) { traceAll(); }
  }

  function trace(key) {
    count++;
    console.error('  ' + count + '. ' + error({ msg: MESSAGES[key] }));
    return true;
  }

  function hasAppKey(queryParams) {
    return (queryParams.applicationKey || queryParams.developerApplicationKey);
  }

  function loginHasData(url) {
    var login = original.config.login;
    var loginUrl = login.entrypointUrl + login.apiPath + login.apiVersionPath + login.resourcePath;
    return loginUrl == url.split('?')[0];
  }

  function showData(data) {
    var json = JSON.parse(data);
    if (!data) { return; }
    if (json && (json.password || json.pass || json.senha)) {
      json.password = json.password.replace(/(.?)/g, '*');
      data = JSON.stringify(json);
    }
    console.error('    data: ' + data);
  }

  function loadErrorsCondition(settings) {
    var matchError;
    var queryParams = original.utils.getUrlParams(settings.url);

    if (!hasAppKey(queryParams)) { matchError = trace('app.key.undefined'); }
    if (!queryParams.callbackUrl) { matchError = trace('callbackUrl.undefined'); }
    if (!queryParams.grantType) { matchError = trace('grantType.undefined'); }
    if (!queryParams.scopes) { matchError = trace('scopes.undefined'); }

    if (loginHasData(settings.url)) {
      matchError = trace('check.login.data');
      showData(settings.data);
    }

    return matchError;
  }

  function traceAll() {
    var prefix = "Couldn't find a specific message for this error, check the full list bellow: \n";
    console.error(prefix);
    _.each(MESSAGES, function (val, key) {
      trace(key);
    });
  }

  $(document).ajaxError(initialize);

} ());