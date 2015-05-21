# es3-safe-recast [![Build Status](https://travis-ci.org/stefanpenner/es3-safe-recast.svg)](https://travis-ci.org/stefanpenner/es3-safe-recast)

Recasts all [ECMAScript 3][1] reserved words to their safe alternatives.


## helpers

* [grunt-es3-safe-recast](https://github.com/phpro/grunt-es3-safe-recast)
* [gulp-dereserve](https://www.npmjs.com/package/gulp-dereserve)
* [broccoli-es3-safe-recast](broccoli-es3-safe-recast)

## Before

```js
ajax('/asdf/1').catch(function(reason) {

}).finally(function() {

});
```

## After

```js
ajax('/asdf/1')['catch'](function(reason) {

})['finally'](function() {

});
```

## Before

```js
object = {
  catch:   function() {},
  finally: function() {},
  default: function() {}
};
```

## After

```js
object = {
  'catch':   function() {},
  'finally': function() {},
  'default': function() {}
};
```

[1]: http://www.ecma-international.org/publications/files/ECMA-ST-ARCH/ECMA-262,%203rd%20edition,%20December%201999.pdf
