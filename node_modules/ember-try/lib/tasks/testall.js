'use strict';
var CoreObject      = require('core-object');
var RSVP            = require('rsvp');
var mapSeries       = require('promise-map-series');
var chalk           = require('chalk');
var ScenarioManager = require('../utils/scenario-manager');
var BowerHelpers    = require('../utils/bower-helpers');
var run             = require('../utils/run');
var findEmberPath   = require('./../utils/find-ember-path');

module.exports = CoreObject.extend({
  run: function(options){
    var task = this;
    var scenarios = this.config.scenarios;
    this.ScenarioManager = new ScenarioManager({ui: this.ui, project: this.project});

    return BowerHelpers.backupBowerFile(task.project.root).then(function() {
      return mapSeries(scenarios, task._testVersion, task).then(function (results) {
        var promise;
        if(options.skipCleanup){
          //create a fake promise for consistency
          promise = RSVP.Promise.resolve();
        } else {
          promise = BowerHelpers.cleanup(task.project.root);
        }
        return promise.then(function(){
          task._printResults(scenarios, results);
          if(results.indexOf(false) > -1){
            process.exit(1);
          }
          else {
            process.exit(0);
          }
        });
      }).catch(function(err){
        task.ui.writeLine(err);
        task.ui.writeLine(err.stack);
        process.exit(1);
      });
    });
  },

  _testVersion: function(scenario){
    var task = this;
    return this.ScenarioManager.changeTo(scenario)
      .then(function(){
        return task._runTests();
      });
  },

  _runTests: function(){
    var task = this;

    return findEmberPath(task.project.root)
      .then(function(emberPath){
        return run('node', [emberPath, 'test'], {cwd: task.project.root})
      })
      .then(function(){
        return RSVP.resolve(true);
      })
      .catch(function(err){
        return RSVP.resolve(false);
      });
  },

  _printResults: function(scenarios, results){
    var task = this;
    task.ui.writeLine('');
    task.ui.writeLine("------ RESULTS ------");
    task.ui.writeLine('');
    scenarios.forEach(function(scenario, index){
      if(results[index]){
        task.ui.writeLine(chalk.green(scenario.name + ': PASS'));
      }
      else {
        task.ui.writeLine(chalk.red(scenario.name + ': FAIL'));
      }
    });
  }
});
