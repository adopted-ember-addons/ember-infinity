var path = require('path');

var assetRev = require('./lib/asset-rev');

module.exports = {
  name: 'broccoli-asset-rev',
  initializeOptions: function() {
    var defaultOptions = {
      enabled: this.app.env === 'production',
      exclude: [],
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map'],
      prepend: '',
      replaceExtensions: ['html', 'css', 'js']
    }
  
    // Allow simply setting { fingerprint: false } as a shortcut option to disable
    if (this.app.options.fingerprint === false) {
      this.options = this.app.options.fingerprint = { enabled: false };
    } else {
      this.options = this.app.options.fingerprint = this.app.options.fingerprint || {};
    }

    for (var option in defaultOptions) {
      if (!this.options.hasOwnProperty(option)) {
        this.options[option] = defaultOptions[option];
      }
    }
  },
  postprocessTree: function (type, tree) {
    if (type === 'all' && this.options.enabled) {
      tree = assetRev(tree, this.options);
    }

    return tree;
  },
  included: function (app) {
    this.app = app;
    this.initializeOptions();
  },
  treeFor: function() {}
}
