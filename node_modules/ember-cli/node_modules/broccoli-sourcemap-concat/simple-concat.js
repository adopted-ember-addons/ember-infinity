var CachingWriter = require('broccoli-caching-writer');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var CombinedStream = require('combined-stream');
var Readable = require('stream').Readable;
var helpers = require('broccoli-kitchen-sink-helpers');
var RSVP = require('rsvp');

module.exports = CachingWriter.extend({
  enforceSingleInputTree: true,

  init: function() {
    this.description = 'SourcemapConcat';
    
    if (!this.separator) {
      this.separator = '\n';
    }
    if (!this.outputFile) {
      throw new Error("outputFile is required");
    }
  },

  updateCache: function(inDir, outDir) {
    var combined = new CombinedStream();
    var firstSection = true;
    var separator = this.separator;

    function beginSection() {
      if (firstSection) {
        firstSection = false;
      } else {
        combined.append(streamFor(separator));
      }
    }

    if (this.header) {
      beginSection();
      combined.append(streamFor(this.header));
    }

    if (this.headerFiles) {
      this.headerFiles.forEach(function(hf) {
        beginSection();
        combined.append(fs.createReadStream(path.join(inDir, hf)));
      });
    }

    try {
      this._addFiles(combined, inDir, beginSection);
    } catch(error) {
      // multiGlob is obtuse.
      if (!error.message.match("did not match any files") || !this.allowNone) {
        throw error;
      }
    }

    if (this.footer) {
      beginSection();
      combined.append(streamFor(this.footer));
    }
    if (this.footerFiles) {
      this.footerFiles.forEach(function(ff) {
        beginSection();
        combined.append(fs.createReadStream(path.join(inDir, ff)));
      }.bind(this));
    }
    return new RSVP.Promise(function(resolve, reject) {
      var filename = path.join(outDir, this.outputFile);
      mkdirp.sync(path.dirname(filename));
      if (firstSection) {
        combined.append(streamFor(null));
      }
      var writer = fs.createWriteStream(filename);
      combined.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    }.bind(this));
  },

  _addFiles: function(combined, inDir, beginSection) {
    helpers.multiGlob(this.inputFiles, {
      cwd: inDir,
      root: inDir,
      nomount: false
    }).forEach(function(file) {
      var fullName = path.join(inDir, file);
      var stat;
      try {
        stat = fs.statSync(fullName);
      } catch(err) {}
      if (stat && !stat.isDirectory()) {
        beginSection();
        combined.append(fs.createReadStream(fullName));
      }
    });
  },

});


function streamFor(string) {
  var r = new Readable();
  r._read = function(){};
  RSVP.async(function(){
    if (string) {
      r.push(string);
    }
    r.push(null);
  });
  return r;
}
