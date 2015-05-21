'use strict';

var Reporter = require('./lib/reporter');
var DependencyChecker = require('./lib/dependency-checker');

module.exports = {
  name: 'ember-cli-dependency-checker',
  init: function() {
    var reporter = new Reporter();
    var dependencyChecker = new DependencyChecker(this.project, reporter);
    dependencyChecker.checkDependencies();
  }
};
