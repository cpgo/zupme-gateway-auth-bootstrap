(function () {
  'use strict';

  $('#company-login').click(function () {
    company.oauth.login({
      callbackUrl: 'consolidate-login.html',
      appId: 'a1sfdf5551de',
      scopes: ['read_bank_info', 'read_personal_data'],
      onSuccess: function () {
        window.location = 'index.html';
      }
    });
  });
}());