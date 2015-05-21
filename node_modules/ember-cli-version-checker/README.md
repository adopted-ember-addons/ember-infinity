### Ember CLI Version Checker

Makes determining if an addon is being used with a compatible version of Ember CLI.

### Usage

#### assertAbove

Throws an error with the given message if a minimum version isn't met.

```javascript
var versionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'awesome-addon',
  init: function() {
    versionChecker.assertAbove(this, '2.0.0');
  }
};
```

You can also provide a specific message as the third argument to `assertAbove` if you'd like to customize the output.

```javascript
var versionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'awesome-addon',
  init: function() {
    versionChecker.assertAbove(this, '2.0.0', 'To use awesome-addon you must have ember-cli 2.0.0');
  }
};
```

#### isAbove

Returns `true` if the Ember CLI version is not above the specified minimum.

```javascript
var versionChecker = require('ember-cli-version-checker');

module.exports = {
  name: 'awesome-addon',
  init: function() {
    if (versionChecker.isAbove(this, '2.0.0')) {
      /* deal with 2.0.0 stuff */
    } else {
      /* provide backwards compat */
    };
  }
};
```
