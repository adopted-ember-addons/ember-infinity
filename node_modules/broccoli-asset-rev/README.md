#broccoli-asset-rev

[Broccoli](https://github.com/broccolijs/broccoli) plugin to add fingerprint checksums to your files and update the source to reflect the new filenames.

Turns

```
<script src="assets/appname.js">
background: url('/images/foo.png');
```

Into

```
<script src="https://subdomain.cloudfront.net/assets/appname-342b0f87ea609e6d349c7925d86bd597.js">
background: url('https://subdomain.cloudfront.net/images/foo-735d6c098496507e26bb40ecc8c1394d.png');
```

## Installation

```js
npm install broccoli-asset-rev --save-dev
```

## Usage

```js
var assetRev = require('broccoli-asset-rev');

var assetTree = assetRev(tree, {
  extensions: ['js', 'css', 'png', 'jpg', 'gif'],
  exclude: ['fonts/169929'],
  replaceExtensions: ['html', 'js', 'css'],
  prepend: 'https://subdomain.cloudfront.net/'
});
```

## Options

  - `extensions` - Default: `['js', 'css', 'png', 'jpg', 'gif', 'map']` - The file types to add md5 checksums.
  - `exclude` - Default: `[]` - An array of strings. If a filename contains any item in the exclude array, it will not be fingerprinted.
  - `replaceExtensions` - Default: `['html', 'css', 'js']` - The file types to replace source code with new checksum file names.
  - `prepend` - Default: `''` - A string to prepend to all of the assets. Useful for CDN urls like `https://subdomain.cloudfront.net/`
  - `generateRailsManifest` - Default: none - If true, will generate a `manifest.json` to be used by Sprockets for the Rails Asset Pipeline
  - `customHash` - Default: none - If set, overrides the md5 checksum calculation with the result of calling `customHash(buffer)`. If it is not a `function`, `customHash` is used as the hash value.

## Ember CLI addon usage

```js
var app = new EmberApp({
  fingerprint: {
    exclude: ['fonts/169929'],
    prepend: 'https://sudomain.cloudfront.net/'
  }
});
```

## Ember CLI addon options

  - `enabled` - Default: `app.env === 'production'` - Boolean. Enables fingerprinting if true. **True by default if current environment is production.**
  - `exclude` - Default: `[]` - An array of strings. If a filename contains any item in the exclude array, it will not be fingerprinted.
  - `extensions` - Default: `['js', 'css', 'png', 'jpg', 'gif', 'map']` - The file types to add md5 checksums.
  - `prepend` - Default: `''` - A string to prepend to all of the assets. Useful for CDN urls like `https://subdomain.cloudfront.net/`
  - `replaceExtensions` - Default: `['html', 'css', 'js']` - The file types to replace source code with new checksum file names.
