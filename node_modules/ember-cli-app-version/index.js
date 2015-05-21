/* global module, require */
'use strict';
var fs = require('fs');

module.exports = {
  name: 'ember-cli-app-version',
  config: function(env, baseConfig) {
    var config = this._super.config.apply(this, arguments);

    var version = require('git-repo-version')(null, this.project.root);
    if (version && baseConfig.APP) {
      baseConfig.APP.name = this.project.pkg.name;
      baseConfig.APP.version = version;
    }

    return config;
  }
};
