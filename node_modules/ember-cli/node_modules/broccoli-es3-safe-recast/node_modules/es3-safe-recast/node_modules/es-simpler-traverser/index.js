module.exports = function traverse(node, visitor) {
  var key, child, children;

  if (node && typeof node === 'object') {
    if (typeof visitor.enter === 'function') {
      visitor.enter(node);
    }

    children = Object.keys(node);

    for (var i = 0; i < children.length; i++) {
      key = children[i];
      child = node[key];

      traverse(child, visitor);
    }

    if (typeof visitor.exit === 'function') {
      visitor.exit(node);
    }
  }
};
