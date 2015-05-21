'use strict';

var path            = require('path');

module.exports = {
  name: 'try:reset',
  description: 'Resets dependencies to their committed state. For when things get messy.',
  works: 'insideProject',

  run: function(commandOptions, rawArgs) {
    var ResetTask = require('../tasks/reset');
    var resetTask = new ResetTask({
      ui: this.ui,
      project: this.project
    });

    return resetTask.run();
  }
};
