(function () {
  var config = company.oauth.config,
      checkLoginRoutine;

  function writeObjectAsCookie(name, value, seconds) {
    var expires = new Date(new Date().getTime() + seconds * 1000).toISOString();
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + '; expires=' + expires;
  }

  function getCookieAsObject(name) {
    var regex = '(^|; )' + name + '=([^;]*)';
    var matches = document.cookie.match(regex);
    if (matches) {
      return JSON.parse(decodeURIComponent(matches[2]));
    }
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  function createObjectFromUrlParameters(urlParams) {
    var params = urlParams.split('&'), obj = {}, i, keyValue;
    for (i = 0; i < params.length; i++) {
      keyValue = params[i].split('=');
      obj[keyValue[0]] = keyValue[1];
    }
    return obj;
  }

  function updateCookieWithAccessToken(accessToken) {
    var authData = company.oauth.getAuthenticationData();
    delete authData.authCode;
    authData.accessToken = accessToken;
    writeObjectAsCookie(config.cookieName, authData, authData.expiresIn);
  }

  function onAuthenticationSuccess(authData, settings) {
    /* if "exchangeTokens" was passed to the login function, the flow is complete and the application will handle the
     * exchange of tokens. */
    if (typeof settings.exchangeTokens === 'function') {
      return settings.exchangeTokens(authData, updateCookieWithAccessToken);
    }
    /* otherwise, the flow is implicit and has already finished */
    if (typeof settings.onSuccess === 'function') {
      settings.onSuccess(authData);
    }
  }

  function startCheckLoginRoutine(settings) {
    checkLoginRoutine = setInterval(function () {
      var authData = company.oauth.getAuthenticationData();
      if (authData) {
        onAuthenticationSuccess(authData, settings);
        clearInterval(checkLoginRoutine);
      }
    }, 500);
  }

  function createQueryString(settings) {
    var query = '?callbackUrl=' + location.origin + '/' + encodeURIComponent(settings.callbackUrl) +
      '&scopes=' + settings.scopes.join(',') +
      '&grantType=' + (settings.exchangeTokens ? 'complete' : 'implicit');

    query += settings.applicationKey ?
      ('&applicationKey=' + encodeURIComponent(settings.applicationKey)) :
      ('&developerApplicationKey=' + encodeURIComponent(settings.developerApplicationKey));

    return query;
  }

  function validateLoginSettings(settings) {
    if (!settings.developerApplicationKey && !settings.applicationKey) {
      throw 'Please, specify one of the following: developerApplicationKey, applicationKey.';
    }
    if (settings.developerApplicationKey && settings.applicationKey) {
      throw 'You can\'t specify both developerApplicationKey and applicationKey. Please, choose one.';
    }
    if (!settings.scopes || !settings.scopes.length) {
      throw 'You need to specify at least one scope for your application.';
    }
  }

  company.oauth = {
    /**
     * Use this function to open the login popup.
     * @param settings
     *   - developerApplicationKey: {string}. Required if applicationKey is absent. It's the key of the developer
     *   application provided in the developer portal. Normally used by third party apps;
     *   - applicationKey: {string}. Required if developerApplicationKey is absent. It's the key of the client
     *   application provided in the API Manager. Normally used for the organization's internal apps;
     *   - scopes: {array}. An array with the scopes required by the application;
     *   - onSuccess: {function}. Optional. Function to be called when the login is completed. Only valid for the
     *   implicit flow. Receives the authentication data as parameter;
     *   - exchangeTokens: {function}. Optional. Should be used when the oauth flow is complete. Its goal is to call the
     *   backend service with the uid and authCode, exchanging it for the final accessToken. This function receives two
     *   parameters: authenticationData and saveAccessToken. The first parameter is an object containing the username,
     *   the uid and the authCode. The second parameter is a function that should be called with the resulting
     *   accessToken.
     */
    login: function (settings) {
      var url;

      validateLoginSettings(settings);

      url = config.oauthUrl + createQueryString(settings);
      clearInterval(checkLoginRoutine); // if there's anything checking the login process, end it
      this.logout(); // remove the authentication cookie if its present
      // open the login popup
      window.open(url, config.popupTitle, 'width=' + config.popupWidth + ', height=' + config.popupHeight);
      // start checking if the user finished logging in
      startCheckLoginRoutine(settings);
    },

    /**
     * Use this function to logout the user (delete the authentication cookie from the local domain).
     */
    logout: function () {
      deleteCookie(config.cookieName);
    },

    /**
     * Should be called by the page specified in the callbackUrl parameter of the login function. It consolidates the
     * login process by saving the authentication data as a cookie in the local domain.
     */
    consolidateLogin: function () {
      var auth = createObjectFromUrlParameters(location.href.split('?')[1]);
      writeObjectAsCookie(config.cookieName, auth, auth.expiresIn);
    },

    /**
     * Get the accessToken, uid and username of the user currently logged in. If no user is logged in, null is returned.
     * @returns the user data or null
     */
    getAuthenticationData: function () {
      return getCookieAsObject(config.cookieName);
    },

    /**
     * Verify if the user is authenticated by checking if the authentication cookie and access token is present.
     * @returns {boolean} true if the user is authenticated. False otherwise.
     */
    isAuthenticated: function () {
      var authData = this.getAuthenticationData();
      return !!(authData && authData.accessToken);
    }
  };
}());