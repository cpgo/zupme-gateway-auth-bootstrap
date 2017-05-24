(function () {
  'use strict';

  window.company = window.company || {};

  function getConfig() {
    var localStorageConfig = localStorage.getItem('Config');
    return localStorageConfig ? JSON.parse(localStorageConfig) : company.config;
  }

  function getUrlParams() {
    var regex = /([^=&\?]+)(=([^&]+))?/g,
        params = {},
        result;

    while ((result = regex.exec(location.search)) !== null) {
      params[result[1]] = result[3] ? decodeURIComponent(result[3]) : undefined;
    }

    return params;
  }

  function encodeObjectToUrl(obj) {
    return _.reduce(obj, function (encoded, value, key) {
      encoded += encoded ? '&' : '';
      encoded += key + '=';
      return encoded + encodeURIComponent(value);
    }, '');
  }

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

  function showErrorPage() {
    var body = $('body');
    body.empty();
    body.load('../error.html');
  }

  function goToLoginPage() {
    location.href = 'login.html' + location.search;
  }

  company.utils = {
    getConfig: getConfig,
    getUrlParams: getUrlParams,
    encodeObjectToUrl: encodeObjectToUrl,
    writeObjectAsCookie: writeObjectAsCookie,
    getCookieAsObject: getCookieAsObject,
    deleteCookie: deleteCookie,
    showErrorPage: showErrorPage,
    goToLoginPage: goToLoginPage
  };
}());