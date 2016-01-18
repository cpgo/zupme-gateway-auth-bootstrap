(function () {
  var OAUTH_URL = 'http://localhost:8080/login.html', // Absolute URL to the oauth login page
      POPUP_WIDTH = 700,
      POPUP_HEIGHT = 650,
      OAUTH_COOKIE_NAME = 'company_oauth',
      OAUTH_COOKIE_EXPIRATION_DAYS = 7;

  window.company = window.company || {};

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
    var checkLoginRoutine = setInterval(function () {
      if (company.oauth.isAuthenticated()) {
        callback(company.oauth.getAuthenticationData());
        clearInterval(checkLoginRoutine);
      }
    }, 500);
  }

  company.oauth = {
    login: function (appKey, callbackUrl, callback) {
      var url = OAUTH_URL;
      url += '?redirect_url=' + location.origin + '/' + encodeURIComponent(callbackUrl);
      url += '&app_key=' + appKey;
      this.logout();
      window.open(url, 'Login - Banco Original', 'width=' + POPUP_WIDTH + ', height=' + POPUP_HEIGHT);
      startCheckLoginRoutine(callback);
    },

    logout: function () {
      deleteCookie(OAUTH_COOKIE_NAME);
    },

    consolidateLogin: function () {
      var userEncoded = location.href.match(/\?.*user=([^&]*)/)[1];
      var auth = {
        user: JSON.parse(decodeURIComponent(userEncoded)),
        uid: location.href.match(/\?.*uid=([^&]*)/)[1],
        token: location.href.match(/\?.*token=([^&]*)/)[1]
      };
      writeObjectAsCookie(OAUTH_COOKIE_NAME, auth, OAUTH_COOKIE_EXPIRATION_DAYS);
    },

    getAuthenticationData: function () {
      return getCookieAsObject(OAUTH_COOKIE_NAME);
    },

    isAuthenticated: function () {
      return !!this.getAuthenticationData();
    }
  };
}());