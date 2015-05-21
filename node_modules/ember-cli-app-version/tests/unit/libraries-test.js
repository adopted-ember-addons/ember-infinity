import config from 'dummy/config/environment';

module('App Version');

test('version is available in config', function(){
  ok(config.APP.version);
});
