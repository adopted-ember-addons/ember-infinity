// Originally implemented by @joliss in `broccoli-bower`
// https://github.com/joliss/broccoli-bower/blob/ea0eec5c5fa736dc3744f3a7bb0b304b7ac9976e/index.js#L10-L12

function UnwatchedTree (dir) {
  if (!(this instanceof UnwatchedTree)) { return new UnwatchedTree(dir); }

  this.dir = dir;
  this.description = 'Unwatched - ' + dir;
}

UnwatchedTree.prototype.read = function (readTree) { return this.dir };
UnwatchedTree.prototype.cleanup = function () { };

module.exports = UnwatchedTree;
