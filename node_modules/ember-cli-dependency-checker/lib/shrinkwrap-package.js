'use strict';

var Package = require('./package');

function ShrinkwrapPackage(name, versionSpecified, versionInstalled, parents) {
  this._super$init.call(this, name, versionSpecified, versionInstalled);
  this.init(name, versionSpecified, versionInstalled, parents);
}

ShrinkwrapPackage.prototype = Object.create(Package.prototype);
ShrinkwrapPackage.prototype.constructor = ShrinkwrapPackage;

ShrinkwrapPackage.prototype._super$init = Package.prototype.init;
ShrinkwrapPackage.prototype.init = function(name, versionSpecified, versionInstalled, parents) {
  this.parents = parents;
};

ShrinkwrapPackage.prototype.updateRequired = function() {
  return this.versionSpecified !== this.versionInstalled;
};

module.exports = ShrinkwrapPackage;
