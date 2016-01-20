(function () {
  'use strict';

  var MINIFIED_CSS = 'css/style.css',
      MINIFIED_JS = 'scripts/app.js';

  var fs = require('fs'),
      glob = require('glob'),
      path = require('path'),
      minify = require('html-minifier').minify;

  var minificationOpts = {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  };

  function initialize() {
    processHtmlFiles('src/*.html', 'dist');
  }

  function processHtmlFiles(srcPattern, targetDirectory) {
    glob(srcPattern, function (er, files) {
      files.forEach(function (file) {
        var dest = targetDirectory + '/' + path.basename(file),
            processed = processHtml(fs.readFileSync(file).toString()),
            minified = minify(processed, minificationOpts);

        writeHtmlFile(minified, dest);
      });
    });
  }

  function processHtml(html) {
    html = processScripts(html);
    return processCssLinks(html);
  }

  function processScripts(html) {
    var processed = removeAppScripts(html);
    if (html != processed) {
      return addMinifiedAppScript(processed);
    }
    return html;
  }

  function processCssLinks(html) {
    var processed = removeCssLinks(html);
    if (html != processed) {
      return addMinifiedCssLink(processed);
    }
    return html;
  }

  function removeAppScripts(html) {
    // remove all scripts with the src attribute starting with "scripts/"
    return html.replace(/<script[^>]+src="scripts\/[^"]+"[^>]*><\/script>/g, '');
  }

  function addMinifiedAppScript(html) {
    var scriptTag = '<script src="' + MINIFIED_JS + '"></script>';
    return html.replace('</body>', scriptTag + '</body>');
  }

  function removeCssLinks(html) {
    // remove all link tags with the href attribute starting with "css/"
    return html.replace(/<link[^>]+href="css\/[^"]+"[^>]*>/g, '');
  }

  function addMinifiedCssLink(html) {
    var linkTag = '<link href="' + MINIFIED_CSS + '" rel="stylesheet" type="text/css">';
    return html.replace('</head>', linkTag + '</head>');
  }

  function writeHtmlFile(content, filePath) {
    fs.writeFile(filePath, content, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }

  initialize();
}());