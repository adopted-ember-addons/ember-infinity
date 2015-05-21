'use strict';

function VersionChecker() {
}

VersionChecker.satisfies = function(versionSpecified, versionInstalled) {
  if (!versionInstalled) {
    return false;
  }

  var version   = versionSpecified;
  var isGitRepo = require('is-git-url');
  var semver    = require('semver');

  if (version === '*') {
    return true;
  } else if (isGitRepo(version)) {
    var parts = version.split('#');
    if (parts.length === 2) {
      version = semver.valid(parts[1]);
      if (!version) {
        return true;
      }
    }
  }

  if (!semver.validRange(version)) {
    return true;
  }

  return semver.satisfies(versionInstalled, version);
};

module.exports = VersionChecker;
