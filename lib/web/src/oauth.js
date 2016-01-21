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

  function exchangeAuthCodeForAccessToken(url, uid, authCode) {
    return $.post(url, JSON.stringify({uid: uid, auth_code: authCode}));
  }

  function completeOauthFlow(authData, backendUrl, onSuccess, onError) {

    function consolidateCompleteflowLogin(response) {
      delete authData.authCode;
      authData.accessToken = response['access_token'];
      writeObjectAsCookie(config.cookieName, authData, config.cookieExpirationDays);

      if (typeof onSuccess === 'function') {
        onSuccess(authData);
      }
    }

    exchangeAuthCodeForAccessToken(backendUrl, authData.uid, authData.authCode)
      .done(consolidateCompleteflowLogin)
      .fail(onError);
  }

  function onAuthenticationSuccess(authData, backendUrl, onSuccess, onError) {
    if (backendUrl) {
      return completeOauthFlow(authData, backendUrl, onSuccess, onError);
    }
    if (typeof onSuccess === 'function') {
      onSuccess(authData);
    }
  }

  function startCheckLoginRoutine(backendUrl, onSuccess, onError) {
    checkLoginRoutine = setInterval(function () {
      var authData = company.oauth.getAuthenticationData();
      if (authData) {
        onAuthenticationSuccess(authData, backendUrl, onSuccess, onError);
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
      '&flow=' + (settings.backendUrl ? 'complete' : 'implicit');
  }

  company.oauth = {
    /**
     * Use this function to open the login popup.
     * @param settings
     *   - callbackUrl: the url in the local domain to consolidate the login (save authentication cookie);
     *   - appId: the id of the app requesting the user to login;
     *   - scopes: an array with the scopes required by the application;
     *   - backendUrl: optional. When present, the oauth flow will be complete. If not present, the oauth flow is
     *   implicit;
     *   - onSuccess: optional. Function to be called when the login is completed. Receives the authentication data as
     *   parameter;
     *   - onError: optional. Function to be called when the  call to app backend fails. Only useful when the flow is
     *   complete. Receives the xhr as parameter.
     */
    login: function (settings) {
      var url = config.oauthUrl + createQueryString(settings);
      clearInterval(checkLoginRoutine);
      this.logout();
      window.open(url, config.popupTitle, 'width=' + config.popupWidth + ', height=' + config.popupHeight);
      startCheckLoginRoutine(settings.backendUrl, settings.onSuccess, settings.onError);
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