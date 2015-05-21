var assert = require('assert');
var versionChecker = require('..');

describe('ember-cli-version-checker', function() {
  function FakeAddonAtVersion(version) {
    this.name = 'fake-addon';
    this.project = {
      emberCLIVersion: function() {
        return version;
      }
    };
  }

  describe('isAbove', function() {
    it('handles metadata after version number', function() {
      var addon = new FakeAddonAtVersion('0.1.15-addon-discovery-752a419d85');

      assert.ok(versionChecker.isAbove(addon, '0.0.0'));

      addon = new FakeAddonAtVersion('0.1.15-addon-discovery-752a419d85');

      assert.ok(!versionChecker.isAbove(addon, '100.0.0'));
    });

    it('does not error if addon does not have `project`', function() {
      var addon = {};

      assert.ok(!versionChecker.isAbove(addon, '0.0.0'));
    });

    it('`0.0.1` should be above `0.0.0`', function() {
      var addon = new FakeAddonAtVersion('0.0.1');

      assert.ok(versionChecker.isAbove(addon, '0.0.0'));
    });

    it('`0.1.0` should be above `0.0.46`', function() {
      var addon = new FakeAddonAtVersion('0.1.0');

      assert.ok(versionChecker.isAbove(addon, '0.0.46'));
    });

    it('`0.1.1` should be above `0.1.0`', function() {
      var addon = new FakeAddonAtVersion('0.1.1');

      assert.ok(versionChecker.isAbove(addon, '0.1.0'));
    });

    it('`1.0.0` should be above `0.1.0`', function() {
      var addon = new FakeAddonAtVersion('1.0.0');

      assert.ok(versionChecker.isAbove(addon, '0.1.0'));
    });

    it('`0.1.0` should be below `1.0.0`', function() {
      var addon = new FakeAddonAtVersion('0.1.0');

      assert.ok(!versionChecker.isAbove(addon, '1.0.0'));
    });

    it('`0.1.0` should be below `0.1.2`', function() {
      var addon = new FakeAddonAtVersion('0.1.0');

      assert.ok(!versionChecker.isAbove(addon, '0.1.2'));
    });
  });

  describe('assertAbove', function() {
    it('throws an error with a default message if a matching version was not found', function() {
      var addon = new FakeAddonAtVersion('0.1.0');
      var message = 'The addon `fake-addon` requires an Ember CLI version of 0.1.2 or above, but you are running 0.1.0.';

      assert.throws(function() {
        versionChecker.assertAbove(addon, '0.1.2',message);
      }, new RegExp(message));
    });

    it('throws an error with the given message if a matching version was not found', function() {
      var addon = new FakeAddonAtVersion('0.1.0');
      var message = 'Must use at least Ember CLI 0.1.2 to use xyz feature';

      assert.throws(function() {
        versionChecker.assertAbove(addon, '0.1.2',message);
      }, new RegExp(message));
    });

    it('throws a silent error', function() {
      var addon = new FakeAddonAtVersion('0.1.0');
      var message = 'Must use at least Ember CLI 0.1.2 to use xyz feature';

      assert.throws(function() {
        versionChecker.assertAbove(addon, '0.1.2',message);
      },

      function(err) {
        return err.suppressStacktrace;
      });
    });
  });
});
