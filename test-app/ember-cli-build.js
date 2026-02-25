'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['ember-infinity'],
    },
    pretender: {
      enabled: true,
    },
  });

  /*
    This build file specifies the options for the test app of this
    addon, located in `/test-app`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  // Import the CSS file
  app.import('node_modules/github-fork-ribbon-css/gh-fork-ribbon.css');

  const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);
};
