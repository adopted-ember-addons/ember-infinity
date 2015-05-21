'use strict';

module.exports = {
  name: 'try:testall',
  description: 'Runs `ember test` with each of the dependency scenarios specified in config.' ,
  works: 'insideProject',

  availableOptions: [
    { name: 'skip-cleanup',  type: Boolean, default: false },
  ],

  run: function(commandOptions, rawArgs) {

    var config = require('../utils/config')({ project: this.project });

    var TestallTask = require('../tasks/testall');

    var testallTask = new TestallTask({
      ui: this.ui,
      project: this.project,
      config: config
    });

    return testallTask.run(commandOptions);
  }
};
