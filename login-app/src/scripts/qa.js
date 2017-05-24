(function () {
  'use strict';

  var conf = company.config;
  var form = $('form')

  function initialize() {
    form.on('submit', submit);
    form.find('input').val(function() {
      return conf.login[this.id];
    });
  }

  function submit(event) {
    var newConfig = _.cloneDeep(conf);

    event.preventDefault();

    $('form').find('input').each(function () {
      newConfig.login[this.id] = this.value;
    });

    localStorage.setItem('Config', JSON.stringify(newConfig));

    company.utils.goToLoginPage();
  }

  initialize();
}());
