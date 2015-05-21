var Filter = require('broccoli-filter');
var path = require('path');

function normalize(str) {
  return str.replace(/[\\\/]+/g, '/');
}

function relative(a, b) {
  if (/\./.test(path.basename(a))) {
    a = path.dirname(a);
  }

  var relativePath = path.relative(a, b);
  // path.relative might have added back \-s on windows
  relativePath = normalize(relativePath);
  return relativePath.charAt(0) !== '.' ? './' + relativePath : relativePath;
}

function AssetRewrite(inputTree, options) {
  if (!(this instanceof AssetRewrite)) {
    return new AssetRewrite(inputTree, options);
  }

  Filter.call(this, inputTree, options);

  options = options || {};

  this.inputTree = inputTree;
  this.assetMap = options.assetMap || {};
  this.extensions = options.replaceExtensions || ['html', 'css'];
  this.prepend = options.prepend || '';
  this.description = options.description;
  this.ignore = options.ignore || []; // files to ignore

  this.assetMapKeys = null;
}

AssetRewrite.prototype = Object.create(Filter.prototype);
AssetRewrite.prototype.constructor = AssetRewrite;

AssetRewrite.prototype.processAndCacheFile = function (srcDir, destDir, relativePath) {
  this._cache = {};

  return Filter.prototype.processAndCacheFile.apply(this, arguments);
}

/**
 * Checks that file is not being ignored and destination doesn't already have a file
 * @param relativePath
 * @returns {boolean}
 */

AssetRewrite.prototype.canProcessFile = function(relativePath) {
  if (!this.assetMapKeys) {
    this.generateAssetMapKeys();
  }

  if (!this.inverseAssetMap) {
    var inverseAssetMap = {};
    var assetMap = this.assetMap;

    Object.keys(assetMap).forEach(function(key) {
      var value = assetMap[key];
      inverseAssetMap[value] = key;
    }, this);

    this.inverseAssetMap = inverseAssetMap;
  }

  /*
   * relativePath can be fingerprinted or not.
   * Check that neither of these variations are being ignored
   */

  if (this.ignore.indexOf(relativePath) !== -1 || this.ignore.indexOf(this.inverseAssetMap[relativePath]) !== -1) {
    return false;
  }

  return Filter.prototype.canProcessFile.apply(this, arguments);
}

AssetRewrite.prototype.rewriteAssetPath = function (string, assetPath, replacementPath) {
  var newString = string;

  /*
   * Replace all of the assets with their new fingerprint name
   *
   * Uses a regular expression to find assets in html tags, css backgrounds, handlebars pre-compiled templates, etc.
   *
   * ["\'\\(=]{1} - Match one of "'(= exactly one time
   * \\s* - Any amount of white space
   * ( - Starts the first pattern match
   * [^"\'\\(\\)=]* - Do not match any of ^"'()= 0 or more times
   * /([.*+?^=!:${}()|\[\]\/\\])/g - Replace .*+?^=!:${}()|[]/\ in filenames with an escaped version for an exact name match
   * [^"\'\\(\\)\\\\>=]* - Do not match any of ^"'()\>= 0 or more times - Explicitly add \ here because of handlebars compilation
   * ) - End first pattern match
   * \\s* - Any amount of white space
   * [\\\\]* - Allow any amount of \ - For handlebars compilation (includes \\\)
   * \\s* - Any amount of white space
   * ["\'\\)> ]{1} - Match one of "'( > exactly one time
   */

  var re = new RegExp('["\'\\(=]{1}\\s*([^"\'\\(\\)=]*' + escapeRegExp(assetPath) + '[^"\'\\(\\)\\\\>=]*)\\s*[\\\\]*\\s*["\'\\)> ]{1}', 'g');
  var match = null;
  /*
   * This is to ignore matches that should not be changed
   * Any URL encoded match that would be ignored above will be ignored by this: "'()=\
   */
  var ignoreLibraryCode = new RegExp('(%22|%27|%5C|%28|%29|%3D)[^"\'\\(\\)=]*' + escapeRegExp(assetPath));

  while (match = re.exec(newString)) {
    var replaceString = '';
    if (ignoreLibraryCode.exec(match[1])) {
      continue;
    }

    if (this.prepend && this.prepend !== '') {
      replaceString = this.prepend + replacementPath;
    } else {
      replaceString = match[1].replace(assetPath, replacementPath);
    }

    newString = newString.replace(new RegExp(escapeRegExp(match[1]), 'g'), replaceString);
  }
  return newString.replace(new RegExp('sourceMappingURL=' + escapeRegExp(assetPath)), function(wholeMatch){
    return wholeMatch.replace(assetPath, replacementPath);
  });
};

AssetRewrite.prototype.processString = function (string, relativePath) {
  var newString = string;

  for (var i = 0, keyLength = this.assetMapKeys.length; i < keyLength; i++) {
    var key = this.assetMapKeys[i];

    if (this.assetMap.hasOwnProperty(key)) {
      /*
       * Rewrite absolute URLs
       */

      newString = this.rewriteAssetPath(newString, key, this.assetMap[key]);

      /*
       * Rewrite relative URLs. If there is a prepend, use the full absolute path.
       */

      var pathDiff = relative(relativePath, key).replace(/^\.\//, "");
      var replacementDiff = relative(relativePath, this.assetMap[key]).replace(/^\.\//, "");

      if (this.prepend && this.prepend !== '') {
        replacementDiff = this.assetMap[key];
      }

      newString = this.rewriteAssetPath(newString, pathDiff, replacementDiff);
    }
  }

  return newString;
};

AssetRewrite.prototype.generateAssetMapKeys = function () {
  var keys = Object.keys(this.assetMap);

  keys.sort(function (a, b) {
    if (a.length < b.length) {
      return 1;
    }

    if (a.length > b.length) {
      return -1;
    }

    return 0;
  });

  this.assetMapKeys = keys;
}

function escapeRegExp(string) {
  return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
}

module.exports = AssetRewrite;
