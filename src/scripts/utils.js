(function () {
  'use strict';

  window.company = window.company || {};

  company.utils = {
    getUrlParam: function (name) {
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
      return results ? results[1] : undefined;
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
    }
  }
}());