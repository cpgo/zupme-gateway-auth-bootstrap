(function () {
  'use strict';

  $('#company-login').click(function () {
    company.oauth.login({
      callbackUrl: 'consolidate-login.html',
      appId: 'a1sfdf5551de',
      scopes: ['read_bank_info', 'read_personal_data'],
      backendUrl: 'http://localhost:8881/create_token',
      onSuccess: function () {
        window.location = 'index.html';
      },
      onError: function () {
        alert('Unable to complete login through backend server.');
      }
    });
  });
}());