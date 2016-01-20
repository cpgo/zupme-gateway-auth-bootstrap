(function () {
  'use strict';

  window.company = window.company || {};

  company.utils = {
    getUrlParams: function () {
      var regex = /([^=&\?]+)(=([^&]+))?/g,
          params = {},
          result;

      while ((result = regex.exec(location.search)) !== null) {
        params[result[1]] = result[3] ? decodeURIComponent(result[3]) : undefined;
      }

      return params;
    },
    writeObjectAsCookie: function (name, value, days) {
      var expires = new Date(new Date().getTime() + days * 24 * 60 * 60000).toISOString();
      document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + '; expires=' + expires;
    },
    getCookieAsObject: function (name) {
      var regex = '(^|; )' + name + '=([^;]*)';
      var matches = document.cookie.match(regex);
      if (matches) {
        return JSON.parse(decodeURIComponent(matches[2]));
      }
    },
    deleteCookie: function (name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }
}());