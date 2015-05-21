# ember-cli-app-version [![Build Status](https://travis-ci.org/embersherpa/ember-cli-app-version.svg)](https://travis-ci.org/embersherpa/ember-cli-app-version) ![[EmberObserver Badge](http://emberobserver.com/addons/ember-cli-app-version)](http://emberobserver.com/badges/ember-cli-app-version.svg)

Adds your Ember App's version to Info tab in Ember Inspector. The version is taken from your project's package.json#version.
If you add build metadata to the version, this addon will automatically append SHA to the end of the version.

![Ember Inspector Info Tab](https://www.evernote.com/shard/s51/sh/c2f52608-bc17-4d5c-ac76-dec044eeb2e2/2f08de0cfb77217502cfc3a9188d84bf/res/3fb1d3d9-d809-48f6-9d3b-6e9a4af29892/skitch.png?resizeSmall&width=832)

## Installation

* npm install --save ember-cli-app-version

## Running Tests

* `git clone git@github.com:taras/ember-cli-app-version.git`
* `npm install`
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
