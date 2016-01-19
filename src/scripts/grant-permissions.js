(function () {
  'use strict';

  var conf = company.config,
      permissionIds;

  function initialize() {
    if (!isAuthenticated()) {
      return location.href = 'login.html';
    }

    loadApplicationData();
    $('#allow').click(allow);
    $('#cancel').click(window.close);
  }

  function isAuthenticated() {
    return !!company.utils.getCookieAsObject(conf.cookieName);
  }

  function loadApplicationData() {
    $.get(conf.apiUrl + '/applications/lala')
      .done(processApplicationData)
      .fail(showUnexpectedError);
  }

  function processApplicationData(appData) {
    $('#application-name').html(appData.name);
    renderPermissions(appData['required_permissions']);
    permissionIds = extractIds(appData['required_permissions']);
    $('.permissions-page').removeClass('hidden');
  }

  function extractIds(permissions) {
    return permissions.map(function (permission) {
      return permission.id;
    });
  }

  function renderPermissions(permissions) {
    var model = $('#permission-model').remove(),
        list = $('.permission-box'),
        i, html;

    for (i = 0; i < permissions.length; i++) {
      html = model.clone();
      html.find('.permission-name').html(permissions[i].name);
      html.find('.permission-description').html(permissions[i].description);
      list.append(html);
    }
  }

  function showUnexpectedError() {
    window.location = 'error.html';
  }

  function allow() {
    grantPermissions()
      .done(redirectToCallbackUrl)
      .fail(showUnexpectedError);
  }

  function grantPermissions() {
    return $.ajax({
      type: 'post',
      url: conf.apiUrl + '/applications/lala/grant_permissions',
      data: JSON.stringify({permissions: permissionIds}),
      headers: {'x-user-token': 'aaaaa'}
    });
  }

  function redirectToCallbackUrl() {
    window.location = company.utils.getUrlParam('callbackUrl');
  }

  function isPermissionsPage() {
    return $('.permissions-page').length;
  }

  if (isPermissionsPage()) {
    initialize();
  }
}());