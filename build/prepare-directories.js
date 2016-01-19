(function () {
  'use strict';

  var DIRECTORIES = ['dist', 'dist/scripts', 'dist/css', 'dist/images', 'dist/lib'];

  var exec = require('child_process').exec,
      fs = require('fs');

  function initialize() {
    if (directoryExists('dist')) {
      removeDirectory('dist', createDirectories);
    } else {
      createDirectories();
    }
  }

  function directoryExists(directory) {
    return fs.existsSync(directory);
  }

  function removeDirectory(directory, callback) {
    exec('rm -r ' + directory, function (err) {
      if (err) {
        return console.log(err);
      }
      callback();
    });
  }

  function createDirectories() {
    var i;
    for (i = 0; i < DIRECTORIES.length; i++) {
      createDirectory(DIRECTORIES[i]);
    }
  }

  function createDirectory(directory) {
    fs.mkdirSync(directory);
  }

  initialize();
}());