'use strict';

/**
  Originally copied from mktemp package: lib/randomstring.js.

  It was (and still is) distributed under the MIT.

  Copyright (c) 2013-2014 sasa+1 <sasaplus1@gmail.com>
**/

var TABLE = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    TABLE_LEN = TABLE.length;

module.exports = function generateRandomString(length) {
  // generate random string
  for (var result = '', i = 0; i < length; ++i) {
    result += TABLE[Math.floor(Math.random() * TABLE_LEN)];
  }

  return result;
};
