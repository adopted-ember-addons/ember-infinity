var builders = require('recast').types.builders;

module.exports = function routeOptionNode(options) {
  options = options || {};

  var node = builders.objectExpression([]);

  if (options.path) {
    node.properties.push(
      builders.property(
        'init',
        builders.identifier('path'),
        builders.literal(options.path)
      )
    );
  }

  return node;
};
