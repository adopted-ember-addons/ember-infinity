var helpers = require('broccoli-kitchen-sink-helpers');
var CachingWriter = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs');
var ConcatWithSourcemap = require('fast-sourcemap-concat');

module.exports = CachingWriter.extend({
  enforceSingleInputTree: true,

  init: function() {
    if (!this.separator) {
      this.separator = '\n';
    }
    if (!this.outputFile) {
      throw new Error("outputFile is required");
    }
    this.encoderCache = {};
  },

  updateCache: function(inDir, outDir) {
    var separator = this.separator;
    var firstSection = true;

    var concat = this.concat = new ConcatWithSourcemap({
      outputFile: path.join(outDir, this.outputFile),
      sourceRoot: this.sourceRoot,
      baseDir: inDir,
      cache: this.encoderCache
    });

    function beginSection() {
      if (firstSection) {
        firstSection = false;
      } else {
        concat.addSpace(separator);
      }
    }

    if (this.header) {
      beginSection();
      concat.addSpace(this.header);
    }

    if (this.headerFiles) {
      this.headerFiles.forEach(function(hf) {
        beginSection();
        concat.addFile(hf);
      });
    }

    try {
      this.addFiles(inDir, beginSection);
    } catch(error) {
      // multiGlob is obtuse.
      if (!error.message.match("did not match any files") || !this.allowNone) {
        throw error;
      }
    }

    if (this.footer) {
      beginSection();
      concat.addSpace(this.footer);
    }
    if (this.footerFiles) {
      this.footerFiles.forEach(function(ff) {
        beginSection();
        concat.addFile(ff);
      });
    }
    return this.concat.end();
  },

  addFiles: function(inDir, beginSection) {
    helpers.multiGlob(this.inputFiles, {
      cwd: inDir,
      root: inDir,
      nomount: false
    }).forEach(function(file) {
      var stat;
      try {
        stat = fs.statSync(path.join(inDir, file));
      } catch(err) {}
      if (stat && !stat.isDirectory()) {
        beginSection();
        this.concat.addFile(file);
      }
    }.bind(this));
  },

});
