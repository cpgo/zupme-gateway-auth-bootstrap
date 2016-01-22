(function () {
  var config = company.oauth.config,
      checkLoginRoutine;

  function writeObjectAsCookie(name, value, days) {
    var expires = new Date(new Date().getTime() + days * 24 * 60 * 60000).toISOString();
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

  function updateCookieWithAccessToken(accessToken) {
    var authData = company.oauth.getAuthenticationData();
    delete authData.authCode;
    authData.accessToken = accessToken;
    writeObjectAsCookie(config.cookieName, authData, config.cookieExpirationDays);
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

  function writeTokenFromUrlToAuthObject(auth) {
    var accessTokenMatch = location.href.match(/\?.*accessToken=([^&]*)/),
        authCodeMatch = location.href.match(/\?.*authCode=([^&]*)/);
    if (authCodeMatch) {
      auth.authCode = decodeURIComponent(authCodeMatch[1]);
    }
    if (accessTokenMatch) {
      auth.accessToken = decodeURIComponent(accessTokenMatch[1]);
    }
  }

  function createQueryString(settings) {
    return '?callbackUrl=' + location.origin + '/' + encodeURIComponent(settings.callbackUrl) +
      '&appId=' + settings.appId +
      '&scopes=' + settings.scopes.join(',') +
      '&flow=' + (settings.exchangeTokens ? 'complete' : 'implicit');
  }

  company.oauth = {
    /**
     * Use this function to open the login popup.
     * @param settings
     *   - appId: {string}. The id of the app requesting the user to login;
     *   - scopes: {array}. An array with the scopes required by the application;
     *   - onSuccess: {function}. Optional. Function to be called when the login is completed. Only valid for the
     *   implicit flow. Receives the authentication data as parameter;
     *   - exchangeTokens: {function}. Optional. Should be used when the oauth flow is complete, its goal is to call the
     *   backend service with the uid and authCode, exchanging it for the final accessToken. This function receives two
     *   parameters: authenticationData and saveAccessToken. The first parameter is an object containing the username,
     *   the uid and the authCode. The second parameter is a function that should be called with the resulting
     *   accessToken.
     */
    login: function (settings) {
      var url = config.oauthUrl + createQueryString(settings);
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
      var auth = {
        username: decodeURIComponent(location.href.match(/\?.*username=([^&]*)/)[1]),
        uid: decodeURIComponent(location.href.match(/\?.*uid=([^&]*)/)[1])
      };
      writeTokenFromUrlToAuthObject(auth);
      writeObjectAsCookie(config.cookieName, auth, config.cookieExpirationDays);
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