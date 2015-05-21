'use strict';

module.exports = {
  name: 'try',
  description: 'Run any `ember` command with the specified dependency scenario',
  works: 'insideProject',

  anonymousOptions: [
    '<scenario>',
    '<command (Default: test)>'
  ],

  availableOptions: [
    { name: 'skip-cleanup',  type: Boolean, default: false },
  ],

  getCommand: function() {
    var args = process.argv.slice();
    var tryIndex = args.indexOf(this.name);
    var subcommandArgs = args.slice(tryIndex + 2);

    //remove ember-try options from the args that are passed on to ember
    var skipIndex = subcommandArgs.indexOf('--skip-cleanup');
    if(skipIndex !== -1){
      subcommandArgs.splice(skipIndex, 1);
    }

    if (subcommandArgs.length === 0) {
      subcommandArgs.push('test');
    }

    return subcommandArgs;
  },

  run: function(commandOptions, rawArgs) {
    var scenarioName = rawArgs[0];
    var commandArgs = this.getCommand();

    if (!scenarioName) {
      throw new Error('The `ember try` command requires a ' +
                      'scenario name to be specified.');
    }

    var config = require('../utils/config')({ project: this.project });
    var scenario = findByName(config.scenarios, scenarioName);

    if(!scenario) {
      throw new Error('The `ember try` command requires a scenario ' +
                      'specified in the ember-try.js config.');
    }

    var TryTask = require('../tasks/try');
    var tryTask = new TryTask({
      ui: this.ui,
      project: this.project,
      config: config
    });

    return tryTask.run(scenario, commandArgs, commandOptions);
  }
};

function findByName(arr, name){
  var matches = arr.filter(function(item){
    if(item.name == name){
      return item;
    }
  });
  return matches[0];
}
