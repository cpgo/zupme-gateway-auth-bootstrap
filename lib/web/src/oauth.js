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

  function startCheckLoginRoutine(callback) {
    checkLoginRoutine = setInterval(function () {
      if (company.oauth.isAuthenticated()) {
        if (typeof callback === 'function') {
          callback(company.oauth.getAuthenticationData());
        }
        clearInterval(checkLoginRoutine);
      }
    }, 500);
  }

  company.oauth = {
    /**
     * Use this function to open the login popup.
     * @param settings
     *   - callbackUrl: the url in the local domain to consolidate the login (save authentication cookie);
     *   - appId: the id of the app requesting the user to login;
     *   - scopes: an array with the scopes required by the application;
     *   - onSuccess: optional. Function to be called when the login is completed. Receives the authentication data as
     *   parameter.
     */
    login: function (settings) {
      var url = config.oauthUrl;
      clearInterval(checkLoginRoutine);
      url += '?callbackUrl=' + location.origin + '/' + encodeURIComponent(settings.callbackUrl);
      url += '&appId=' + settings.appId;
      url += '&scopes=' + settings.scopes.join(',');
      this.logout();
      window.open(url, config.popupTitle, 'width=' + config.popupWidth + ', height=' + config.popupHeight);
      startCheckLoginRoutine(settings.onSuccess);
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
        uid: decodeURIComponent(location.href.match(/\?.*uid=([^&]*)/)[1]),
        accessToken: decodeURIComponent(location.href.match(/\?.*accessToken=([^&]*)/)[1])
      };
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
     * Verify if the user is authenticated by checking if the authentication cookie is present.
     * @returns {boolean} true if the user is authenticated. False otherwise.
     */
    isAuthenticated: function () {
      return !!this.getAuthenticationData();
    }
  };
}());