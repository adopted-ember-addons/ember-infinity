# Broccoli Funnel

[![Build Status](https://travis-ci.org/rwjblue/broccoli-funnel.svg?branch=master)](https://travis-ci.org/rwjblue/broccoli-funnel)

Broccoli Funnel is a plugin that filters a tree and returns a new tree that
represents a subset of the files in the original tree. The filters are
expressed as regular expressions.

Inspired by [broccoli-static-compiler](https://github.com/joliss/broccoli-static-compiler).

## Documentation

### `Funnel(inputTree, options)`

`inputTree` *{Single tree}*

A Broccoli tree. A tree in Broccoli can be either a string that references a
directory in your project or a tree structure returned from running another
Broccoli filter.

If your project has the following file structure:

```shell
.
├── Brocfile.js
└── src/
    ├── css/
    │   ├── reset.css
    │   └── todos.css
    ├── icons/
    │   ├── check-mark.png
    │   └── logo.jpg
    └── javascript/
        ├── app.js
        └── todo.js
```

You can select a subsection of the tree via Funnel:

```javascript
var Funnel = require('broccoli-funnel');
var cssFiles = new Funnel('src/css');

/*
  cssFiles is now equivalent to this tree:

  ├── reset.css
  └── todos.css
*/

// export a tree for Broccoli to begin processing
module.exports = cssFiles;
```

#### Options

`srcDir` *{String}*

A string representing the portion of the input tree to start the funneling
from. This will be the base path for any `include`/`exclude` regexps.

Default: `'.'`, the root path of input tree.

If your project has the following file structure:

```shell
.
├── Brocfile.js
└── src/
    ├── css/
    │   ├── reset.css
    │   └── todos.css
    ├── icons/
    │   ├── check-mark.png
    │   └── logo.jpg
    └── javascript/
        ├── app.js
        └── todo.js
```

You can select a subsection of the tree via Funnel:

```javascript
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

// root of our source files
var projectFiles = 'src';

/* get a new tree of only files in the 'src/css' directory
  cssFiles is equivalent to the tree:

  ├── reset.css
  └── todos.css
*/
var cssFiles = new Funnel(projectFiles, {
  srcDir: 'css'
});

/* get a new tree of only files in the 'src/icons' directory
  imageFiles is equivalent to the tree:

  ├── check-mark.png
  └── logo.jpg
*/
var imageFiles = new Funnel(projectFiles, {
  srcDir: 'icons'
});


module.exports = mergeTrees([cssFiles, imageFiles]);
```

----

`destDir` *{String}*

A string representing the destination path that filtered files will be copied to.

Default: `'.'`, the root path of input tree.

If your project has the following file structure:

```shell
.
├── Brocfile.js
└── src/
    ├── css/
    │   ├── reset.css
    │   └── todos.css
    ├── icons/
    │   ├── check-mark.png
    │   └── logo.jpg
    └── javascript/
        ├── app.js
        └── todo.js
```

You can select a subsection of the tree via Funnel and copy it to a new location:

```javascript
var Funnel = require('broccoli-funnel');

var cssFiles = new Funnel('src/css', {
  destDir: 'build'
});

/*
  cssFiles is equivalent to the tree:

  build/
  ├── reset.css
  └── todos.css
*/

module.exports = cssFiles;
```

----

`allowEmpty` *{Boolean}*

When using `srcDir`/`destDir` options only (aka no filtering via `include`/`exclude` options), if the `srcDir` were missing an error would be thrown.
Setting `allowEmpty` to true, will prevent that error by creating an empty directory at the destination path.

----

`include` *{Array of RegExps|Glob Strings|Functions}*

One or more matcher expression (regular expression, glob string, or function). Files within the tree whose names match this
expression will be copied (with the location inside their parent directories
preserved) to the `destDir`.

Default: `[]`.

If your project has the following file structure

```shell
.
├── Brocfile.js
└── src/
    ├── css/
    │   ├── reset.css
    │   └── todos.css
    ├── icons/
    │   ├── check-mark.png
    │   └── logo.jpg
    └── javascript/
        ├── app.js
        └── todo.js
```

You can select files that match a regular expression copy those subtrees to a
new location, preserving their location within parent directories:

```javascript
var Funnel = require('broccoli-funnel');

// finds all files that match /todo/ and moves them
// the destDir
var todoRelatedFiles = new Funnel('src', {
  include: [new RegExp(/todo/)]
});

/*
  todoRelatedFiles is equivalent to the tree:
  .
  ├── css
  │   └── todos.css
  └── javascript
      └── todo.js
*/

module.exports = todoRelatedFiles;
```

----

`exclude` *{Array of RegExps|Glob Strings|Functions}*

One or more matcher expression (regular expression, glob string, or function). Files within the tree whose names match this
expression will _not_ be copied to the `destDir` if they otherwise would have
been.

*Note, in the case when a file matches both an include and exclude pattern,
the exclude pattern wins*

Default: `[]`.

If your project has the following file structure:

```shell
.
├── Brocfile.js
└── src/
    ├── css/
    │   ├── reset.css
    │   └── todos.css
    ├── icons/
    │   ├── check-mark.png
    │   └── logo.jpg
    └── javascript/
        ├── app.js
        └── todo.js
```

You can select files that match a regular expression exclude them from copying:

```javascript
var Funnel = require('broccoli-funnel');

// finds all files in 'src' EXCEPT those that match /todo/
// and adds them to a tree.
var nobodyLikesTodosAnyway = new Funnel('src', {
  exclude: [new RegExp(/todo/)]
});

/*
  nobodyLikesTodosAnyway is equivalent to the tree:
  .
  ├── css
  │   └── reset.css
  ├── icons
  │   ├── check-mark.png
  │   └── logo.jpg
  └── javascript
      └── app.js
*/

module.exports = nobodyLikesTodosAnyway;
```

----

`files` *{Array of Strings}*

One or more relative file paths. Files within the tree whose relative paths match
will be copied (with the location inside their parent directories
preserved) to the `destDir`.

Default: `[]`.

If your project has the following file structure

```shell
.
├── Brocfile.js
└── src/
    ├── css/
    │   ├── reset.css
    │   └── todos.css
    ├── icons/
    │   ├── check-mark.png
    │   └── logo.jpg
    └── javascript/
        ├── app.js
        └── todo.js
```

You can select a specific list of files copy those subtrees to a
new location, preserving their location within parent directories:

```javascript
var Funnel = require('broccoli-funnel');

// finds these specific files and moves them to the destDir
var someFiles = new Funnel('src', {
  files: ['css/reset.css', 'icons/check-mark.png']
});

/*
  someFiles is equivalent to the tree:
  .
  ├── css
  │   └── reset.css
  └── icons
      └── check-mark.png
*/

module.exports = someFiles;
```

----

`getDestinationPath` *{Function}*

This method will get called for each file, receiving the currently processing
`relativePath` as its first argument. The value returned from
`getDestinationPath` will be used as the destination for the new tree. This is
a very simple way to move files from one path to another (replacing the need
for `broccoli-file-mover` for example).

The return value of this method is cached for each input file. This means that
`getDestinationPath` will only be called once per `relativePath`.

In the following example, `getDestinationPath` is used to move `main.js` to
`ember-metal.js`:

```javascript
var tree = new Funnel('packages/ember-metal/lib', {
  destDir: 'ember-metal',

  getDestinationPath: function(relativePath) {
    if (relativePath === 'lib/main.js') {
      return 'ember-metal.js';
    }

    return relativePath;
  }
});
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
