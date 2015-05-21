'use strict';

var semver = require('semver');

function getEmberCLIVersion(addon) {
  if (!addon.project || !addon.project.emberCLIVersion) {
    return null;
  }

  var version = addon.project.emberCLIVersion();

  // remove any meta-data, for dealing with `npm link`'ed ember-cli
  return version.split('-')[0];
}

function satisfies(addon, comparison) {
  var version = getEmberCLIVersion(addon);

  if (!version) {
    return false;
  }

  return semver.satisfies(version, comparison);
}

function isAbove(addon, minimumVersion) {
  return satisfies(addon, '>=' + minimumVersion);
}

function assertAbove(addon, minimumVersion, _message) {
  var message = _message;

  if (!message) {
    message = 'The addon `' + addon.name + '` requires an Ember CLI version of ' + minimumVersion +
              ' or above, but you are running ' + getEmberCLIVersion(addon) + '.';
  }

  if (!isAbove(addon, minimumVersion)) {
    var error  = new Error(message);

    error.suppressStacktrace = true;
    throw error;
  }
}

module.exports = {
  isAbove: isAbove,
  satisfies: satisfies,
  assertAbove: assertAbove
}
