define('reexport', ['exports', 'inner/first'], function (exports, meaningOfLife) {

	'use strict';

	Object.defineProperty(exports, 'meaningOfLife', { enumerable: true, get: function () { return meaningOfLife['default']; }});

});