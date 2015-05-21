# Broccoli Caching Writer

[![Build Status](https://travis-ci.org/rwjblue/broccoli-caching-writer.svg?branch=master)](https://travis-ci.org/rwjblue/broccoli-caching-writer)

Adds a thin caching layer based on the computed hash of the input tree. If the input tree has changed,
the `updateCache` method will be called, otherwise (input is the same) the results of the last `updateCache`
call will be used instead.

If you would prefer to perform your plugins work in a non-synchronous way, simply return a promise from `updateCache`.

## Documentation

### `CachingWriter(inputTrees, options)`

`inputTrees` *{Array of Trees | Single Tree}*

Can either be a single tree, or an array of trees. If an array was specified, an array of source paths will be provided when
calling `updateCache`.

#### Options

`filterFromCache.include` *{Array of RegExps}*

An array of regular expressions that files and directories in the input tree must pass (match at least one pattern) in order to be included in the cache hash for rebuilds. In other words, a whitelist of patterns that identify which files and/or directories can trigger a rebuild.


Default: `[]`

----

`filterFromCache.exclude` *{Array of RegExps}*

An array of regular expressions that files and directories in the input tree cannot pass in order to be included in the cache hash for rebuilds. In other words, a blacklist of patterns that identify which files and/or directories will never trigger a rebuild.

*Note, in the case when a file or directory matches both an include and exlude pattern, the exclude pattern wins*

Default: `[]`


## Switching from `broccoli-writer`

If your broccoli plugin currently extends `broccoli-writer`,
and you wish to extend `broccoli-caching-writer` instead:

1. Switch the constructor
  - Require this module: `var CachingWriter  = require('broccoli-caching-writer');`
  - Change the prototype to use `CachingWriter`: `MyBroccoliWriter.prototype = Object.create(CachingWriter.prototype);`
  - In the constructor, ensure that you are calling `CachingWriter.apply(this, arguments);`.
2. Switch `write` function for an `updateCache` function.
  - Switch the function signatures:
    - From: `MyBroccoliWriter.prototype.write = function(readTree, destDir) {`
    - To: `MyBroccoliWriter.prototype.updateCache = function(srcDir, destDir) {`
  - Get rid of `readTree`, as `srcPaths` (array of paths from input trees) is already provided:
    - Code that looks like: `return readTree(this.inputTree).then(function (srcPaths) { /* Do the main processing */ });`
    - Simply extract the code, `/* Do the main processing */`, and get rid of the function wrapping it.

## Inheritance

broccoli-caching-writer inherits from [core-object](https://github.com/stefanpenner/core-object) to allow super simple
inheritance. You can still absolutely use the standard prototypal inheritance, but as you can see below there may be no
need.

Make an `index.js` for your package:

```javascript
var CachingWriter = require('broccoli-caching-writer');

module.exports = CachingWriter.extend({
  init: function(inputTrees, options) {
    /* do additional setup here */
  },

  updateCache: function(srcPaths, destDir) {
    /* do main processing */
  }
});
```

Then in a consuming Brocfile:

```javascript
var MyFoo = require('my-foo'); // package from above

var tree = new MyFoo([someInput], { some: 'options' });
```


## ZOMG!!! TESTS?!?!!?

I know, right?

Running the tests:

```javascript
npm install
npm test
```

## License

This project is distributed under the MIT license.
