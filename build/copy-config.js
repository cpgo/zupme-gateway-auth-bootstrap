(function () {
  'use strict';

  var fs = require('fs'),
      _ = require('lodash'),
      yargs = require('yargs');

  function initialize() {
    var env = yargs.argv.env || 'development',
        config = getConfigByEnvironment(env);

    copyConfig('company.config', 'src/scripts/config.js', config.app);
    copyConfig('company.oauth.config', 'src/lib/lib.config.js', config.lib);
  }

  function getConfigByEnvironment(env) {
    return JSON.parse(fs.readFileSync('config/' + env + '.json').toString());
  }

  function copyConfig(variableName, destination, config) {
    var script = generateScript(variableName, config);
    writeFile(script, destination);
  }

  function generateScript(variableName, config) {
    var script = '(function(){\'use strict\';';
    script += declareNamespace(variableName);
    script += writeConfig(variableName, config);
    script += '}());';
    return script;
  }

  function declareNamespace(variableName) {
    var parts = variableName.split('.'),
        namespace = 'window',
        script = '';

    parts.pop();
    _.forEach(parts, function (part) {
      script += namespace + '.' + part + '=' + namespace + '.' + part + '||{};';
      namespace += '.' + part;
    });

    return script;
  }

  function writeConfig(variableName, config) {
    return variableName + '=' + JSON.stringify(config) + ';';
  }

  function writeFile(content, filePath) {
    fs.writeFile(filePath, content, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  initialize();
}());