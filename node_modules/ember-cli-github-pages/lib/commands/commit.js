'use strict';

var exec = require('child_process').exec;
var RSVP = require('rsvp');

module.exports = {
  name: 'github-pages:commit',
  aliases: ['gh-pages:commit'],
  description: 'Build the test app for production and commit it into the gh-pages branch',
  works: 'insideProject',

  availableOptions: [{
    name:         'message',
    type:         String,
    default:      'new gh-pages version',
    description:  'The commit message to include with the build, must be wrapped in quotes.'
  }],

  run: function(options, rawArgs) {
    var ui          = this.ui;
    var root        = this.project.root;
    var execOptions = { cwd: root };

    function buildApp() {
      return runCommand('ember build --environment=production', execOptions);
    }

    function checkoutGhPages() {
      return runCommand('git checkout gh-pages', execOptions);
    }

    function copy() {
      return runCommand('cp -R dist/* .', execOptions);
    }

    function addAndCommit() {
      return runCommand('git add . && git commit -m "' + options.message + '"', execOptions)
    }

    return buildApp()
      .then(checkoutGhPages)
      .then(copy)
      .then(addAndCommit).then(function() {
        ui.write('Done. All that\'s left is to git push the gh-pages branch.\n');
      });
  }
};

function runCommand(/* child_process.exec args */) {
  var args = Array.prototype.slice.call(arguments);

  var lastIndex = args.length - 1;
  var lastArg   = args[lastIndex];
  var logOutput = false;
  if (typeof lastArg === 'boolean') {
    logOutput = lastArg;
    args.splice(lastIndex);
  }

  return new RSVP.Promise(function(resolve, reject) {
    var cb = function(err, stdout, stderr) {
      if (logOutput) {
        if (stderr) {
          console.log(stderr);
        }

        if (stdout) {
          console.log(stdout);
        }
      }

      if (err) {
        return reject(err);
      }

      return resolve();
    };

    args.push(cb);
    exec.apply(exec, args);
  }.bind(this));
}
