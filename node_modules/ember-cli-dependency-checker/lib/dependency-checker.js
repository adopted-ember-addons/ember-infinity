'use strict';

var path       = require('path');
var fs         = require('fs');
var readFile   = fs.readFileSync;
var readDir    = fs.readdirSync;
var fileExists = fs.existsSync;
var Package    = require('./package');

var alreadyChecked = false;

function isUnsatisfied(pkg) {
  return !!pkg.needsUpdate;
}

function EmberCLIDependencyChecker(project, reporter) {
  this.project = project;
  this.reporter = reporter;
}

// Legacy Ember-CLI (before 0.2.4) does not have a `nodeModulesPath` property
function readNodeModulesPath(project) {
  if (project.nodeModulesPath) {
    return project.nodeModulesPath;
  } else {
    return path.join(project.root, 'node_modules');
  }
}

EmberCLIDependencyChecker.prototype.checkDependencies = function() {
  if (alreadyChecked || process.env.SKIP_DEPENDENCY_CHECKER) {
    return;
  }

  var bowerDeps = this.readBowerDependencies();
  this.reporter.unsatisifedPackages('bower', bowerDeps.filter(isUnsatisfied));

  var npmDeps = this.readNPMDependencies();
  var unsatisfiedDeps = npmDeps.filter(isUnsatisfied);
  this.reporter.unsatisifedPackages('npm', unsatisfiedDeps);

  if (unsatisfiedDeps.length === 0) {
    var shrinkWrapDeps = this.readShrinkwrapDeps();
    this.reporter.unsatisifedPackages('npm-shrinkwrap', shrinkWrapDeps.filter(isUnsatisfied));
  }

  EmberCLIDependencyChecker.setAlreadyChecked(true);

  this.reporter.report();
};

EmberCLIDependencyChecker.prototype.readShrinkwrapDeps = function() {
  var filePath = path.join(this.project.root, 'npm-shrinkwrap.json');
  if (fileExists(filePath)) {
    var ShrinkWrapChecker = require('./shrinkwrap-checker');
    var shrinkWrapBody = readFile(filePath);
    var shrinkWrapJSON = {};
    try {
      shrinkWrapJSON = JSON.parse(shrinkWrapBody);
    } catch(e) {
      // JSON parse error
    }
    return ShrinkWrapChecker.checkDependencies(this.project.root, readNodeModulesPath(this.project), shrinkWrapJSON);
  } else {
    return [];
  }
};

EmberCLIDependencyChecker.prototype.lookupNodeModuleVersion = function(name) {
  var nodePackage = path.join(readNodeModulesPath(this.project), name, 'package.json');
  return this.lookupPackageVersion(nodePackage);
};

EmberCLIDependencyChecker.prototype.lookupBowerPackageVersion = function(name) {
  var packageDirectory = path.resolve(this.project.root, this.project.bowerDirectory, name);
  var version = null;
  if (fileExists(packageDirectory) && readDir(packageDirectory).length > 0) {
    var dotBowerFile = path.join(packageDirectory, '.bower.json');
    version = this.lookupPackageVersion(dotBowerFile);
    if (!version) {
      var bowerFile = path.join(packageDirectory, 'bower.json');
      version = this.lookupPackageVersion(bowerFile) || '*';
    }
  }
  return version;
};

EmberCLIDependencyChecker.prototype.lookupPackageVersion = function(path) {
  if (fileExists(path)) {
    var pkg = readFile(path);
    var version = null;
    try {
      version = JSON.parse(pkg).version || null;
    } catch(e) {
      // JSON parse error
    }
    return version;
  } else {
    return null;
  }
};

EmberCLIDependencyChecker.prototype.readBowerDependencies = function() {
  var dependencies = this.project.bowerDependencies();

  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupBowerPackageVersion(name);
    return new Package(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.prototype.readNPMDependencies = function() {
  var dependencies = this.project.dependencies();

  return Object.keys(dependencies).map(function(name) {
    var versionSpecified = dependencies[name];
    var versionInstalled = this.lookupNodeModuleVersion(name);
    return new Package(name, versionSpecified, versionInstalled);
  }, this);
};

EmberCLIDependencyChecker.setAlreadyChecked = function(value) {
  alreadyChecked = value;
};

module.exports = EmberCLIDependencyChecker;
