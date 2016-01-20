(function () {
  'use strict';

  var fs = require('fs'),
      glob = require('glob'),
      path = require('path');

  function initialize() {
    copyFiles('src/images/*.*', 'dist/images');
  }

  function copyFiles(pattern, directory) {
    glob(pattern, function (er, files) {
      files.forEach(function (file) {
        var dest = directory + '/' + path.basename(file);
        fs.createReadStream(file).pipe(fs.createWriteStream(dest));
      });
    });
  }

  initialize();
}());