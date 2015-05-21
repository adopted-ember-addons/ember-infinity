## Broccoli Unwatched Tree

This is useful if you would like to use a given directory, but not have it polled/watched when running
`broccoli serve` (or `ember server` if using Ember CLI).

Originally implemented by @joliss in `broccoli-bower` (see [here](https://github.com/joliss/broccoli-bower/blob/ea0eec5c5fa736dc3744f3a7bb0b304b7ac9976e/index.js#L10-L12)).

### Usage

To use the `vendor/` directory as a tree, but not watch its contents for changes do the following:

```
var vendorTree = new UnwatchedTree('vendor');
```

You can continue to use this tree just like any of the others, but due to the way it is implemented
the standard Broccoli::Watcher class will not check it for file changes.
