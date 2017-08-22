/*jshint node:true*/
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "launch_in_ci": [
    "Chrome"
  ],
  "launch_in_dev": [
    "Chrome",
    "Firefox"
  ],
  "browser_args": {
    "Chrome": {
      "mode": "ci",
      "args": [ '--headless', '--disable-gpu', '--remote-debugging-port=9222' ]
    }
  },
};
