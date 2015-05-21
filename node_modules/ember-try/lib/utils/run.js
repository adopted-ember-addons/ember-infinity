/* jshint node: true */

var RSVP = require('rsvp');
var spawn = require('child_process').spawn;

function run(command, args, opts) {
  opts = opts || {};
  opts.stdio = 'inherit';
  return new RSVP.Promise(function(resolve, reject) {
    var p = spawn(command, args, opts);
    p.on('close', function(code){
      if (code !== 0) {
        reject(command + " exited with nonzero status");
      } else {
        resolve();
      }
    });
  });
}

module.exports = run;
