'use strict';

function Package() {
  this.init.apply(this, arguments);
}

Package.prototype = Object.create({});
Package.prototype.constructor = Package;

Package.prototype.init = function(name, versionSpecified, versionInstalled) {
  this.name = name;
  this.versionSpecified = versionSpecified;
  this.versionInstalled = versionInstalled;
  this.needsUpdate = this.updateRequired();
};

Package.prototype.updateRequired = function() {
  var VersionChecker = require('./version-checker');
  return !VersionChecker.satisfies(this.versionSpecified, this.versionInstalled);
};

module.exports = Package;
