var path   = require('path');
var RSVP   = require('rsvp');
var resolve = RSVP.denodeify(require('resolve'));

module.exports = function(root) {
  // find ember-cli's entry point module relative to
  // the current projects root
  return resolve('ember-cli', { basedir: root })
    .then(function(emberPath) {
      // return the path to the ember command script
      return path.join(emberPath, '..', '..', '..', 'bin', 'ember');
    });
};
