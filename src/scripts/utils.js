(function () {
  'use strict';

  window.company = window.company || {};

  company.utils = {
    getUrlParam: function (name) {
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
      return results ? results[1] : undefined;
    }
  }
}());