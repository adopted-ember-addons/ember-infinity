# broccoli-merge-trees

[![Build Status](https://travis-ci.org/broccolijs/broccoli-merge-trees.png?branch=master)](https://travis-ci.org/broccolijs/broccoli-merge-trees)

Copy multiple trees on top of each other, resulting in a single merged tree.

## Installation

```bash
npm install --save-dev broccoli-merge-trees
```

## Usage

```js
var mergeTrees = require('broccoli-merge-trees');

var outputTree = mergeTrees(inputTrees, options);
```

* **`inputTrees`**: An array of trees

* **`options`**: A hash of options

### Options

* `overwrite`: By default, broccoli-merge-trees throws an error when a file
  exists in multiple trees. If you pass `{ overwrite: true }`, the resulting
  tree will contain the version of the file as it exists in the last input
  tree that contains it.

## Contributing

Clone this repo and run the tests like so:

```
npm install
npm test
```

Issues and pull requests are welcome. If you change code, be sure to re-run
`npm test`. Oftentimes it's useful to add or update tests as well.
