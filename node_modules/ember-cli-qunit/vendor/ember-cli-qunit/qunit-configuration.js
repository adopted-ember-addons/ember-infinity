/* globals jQuery,QUnit */

QUnit.config.urlConfig.push({ id: 'nocontainer', label: 'Hide container'});
QUnit.config.urlConfig.push({ id: 'nojshint', label: 'Disable JSHint'});
QUnit.config.urlConfig.push({ id: 'dockcontainer', label: 'Dock container'});
QUnit.config.testTimeout = 60000; //Default Test Timeout 60 Seconds

if (QUnit.notifications) {
  QUnit.notifications({
    icons: {
      passed: '/assets/passed.png',
      failed: '/assets/failed.png'
    }
  });
}

jQuery(document).ready(function() {
  var containerVisibility = QUnit.urlParams.nocontainer ? 'hidden' : 'visible';
  var containerPosition = QUnit.urlParams.dockcontainer ? 'absolute' : 'relative';
  document.getElementById('ember-testing-container').style.visibility = containerVisibility;
  document.getElementById('ember-testing-container').style.position = containerPosition;
});
