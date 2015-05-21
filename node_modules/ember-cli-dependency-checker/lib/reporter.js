'use strict';

function installCommand(type) {
  switch (type) {
  case 'npm':
    return 'npm install';
  case 'npm-shrinkwrap':
    return 'rm -rf node_modules/ && npm install';
  case 'bower':
    return 'bower install';
  }
}

var Reporter = function() {
  this.messages = [];
};

Reporter.prototype.unsatisifedPackages = function(type, packages) {
  this.chalk = this.chalk || require('chalk');
  this.EOL   = this.EOL || require('os').EOL;

  var chalk = this.chalk;
  var EOL   = this.EOL;

  if (packages.length > 0) {
    var message = '';
    message += EOL + chalk.red('Missing ' + type + ' packages: ') + EOL;

    packages.forEach(function(pkg) {
      message += chalk.reset('Package: ') + chalk.cyan(pkg.name) + EOL;
      if (pkg.parents) {
        message += chalk.reset('Required by: ') + chalk.cyan(pkg.parents.join(' / ')) + EOL;
      }
      message += chalk.grey('  * Specified: ') + chalk.reset(pkg.versionSpecified) + EOL;
      message += chalk.grey('  * Installed: ') + chalk.reset(pkg.versionInstalled || '(not installed)') + EOL + EOL;
    });

    message += chalk.red('Run `'+ installCommand(type) +'` to install missing dependencies.') + EOL;
    this.messages.push(message);
  }
};

Reporter.prototype.report = function() {
  if (this.messages.length) {
    var DependencyError = require('./dependency-error');
    throw new DependencyError(this.messages.join(''));
  }
};

module.exports = Reporter;
