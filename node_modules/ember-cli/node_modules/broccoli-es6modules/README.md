#broccoli-es6modules

ES6Modules is a broccoli filter that transpiles source code in a
project from ES6 modules to ES5 modules in AMD, CJS, or UMD styles.

ES6Modules has two modes of transpilation: 1-to-1 (per-file) and n-to-1 (bundled);

## 1-to-1 transpiles

1-to-1 mode transpiles every file in a tree from ES6 to the format specified
as the `format` option.

For example, if you have the following directory:

```shell
src/
├── lib
│   ├── promise.js
│   ├── rsvp.js
│   └── utils.js
└── main.js
```

And convert the files using ES6Modules:

```javascript
var tree = './src';
var ES6Modules = require('broccoli-es6modules');
var amdFiles = new ES6Modules(tree, {
  format: 'amd'
});
```

You will have the following tree in your compiled output


```shell
├── lib
│   ├── promise.js
│   ├── rsvp.js
│   └── utils.js
└── main.js
```

And each file's contents will be converted from ES6 module syntax to AMD style.

## n-to-1 bundled transpiles

n-to-1 mode begins transpiling at a single entry point and walks the dependency graph starting
with the imported statements in the entry point.

This will result in a single, bundled file for your library containing any
files referenced by `import` statements. Enable this mode by supplying a
`bundleOptions` option with (at least) a `name` for your resulting file and a
file to be the `entry` point:

For example, if you have the following directory:

```shell
src/
├── lib
│   ├── promise.js
│   ├── rsvp.js
│   └── utils.js
└── main.js
```

And convert these files using ES6Modules:

```javascript
var tree = './src';
var ES6Modules = require('broccoli-es6modules');
var amdFiles = new ES6Modules(tree, {
  format: 'amd',
  bundleOptions: {
    entry: 'main.js',
    name: 'myLib'
  }
});
```

You will have the following tree in your compiled output


```shell
└── myLib.js
```

The contents of that file will be any code imported from `main.js`'s import process.

## Options

### format
The ES5 module format to convert to. Available options are:

  * ['amd'](http://requirejs.org/docs/whyamd.html#amd)
  * ['namedAmd'](http://requirejs.org/docs/whyamd.html#namedmodules)
  * ['cjs'](http://requirejs.org/docs/whyamd.html#commonjs)
  * ['umd'](https://github.com/umdjs/umd)


In `namedAmd` the file path (with '.js' removed) of the file relative to the tree root
is used as the module's name.

So, if you have the following tree:

```

├── inner
│   └── first.js
└── outer.js
```

You will have the following module names passed to AMD's `define` call:
'bundle', 'inner/first', and  'outer'.

Because this strategy combined with UMD would result in _many_ properties being set on
the `window` object in the browser, `umd` format will throw an error if used without also
providing `bundleOptions`.

### esperantoOptions
ES6Modules wraps the [esperanto](http://esperantojs.org/) library. All [options described for
esperanto](https://github.com/esperantojs/esperanto/wiki/Converting-a-single-module#options)
can be provided here. All defaults are identical to those used by esperanto.

Because the ES6Modules uses each file's name as its module name, the esperanto `amdName` and
`sourceMapSource` options are ignored.

### bundleOptions
ES6Modules wraps the [esperanto](http://esperantojs.org/) library. All [options described for
esperanto bundling](https://github.com/esperantojs/esperanto/wiki/Bundling-multiple-ES6-modules#other-formats-and-options)
can be provided here. All defaults are identical to those used by esperanto.

The value you provide for `esperantoOptions` will be passed to result of bundling, resulting
in a single output file.
