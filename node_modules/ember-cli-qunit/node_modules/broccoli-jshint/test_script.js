var fs       = require('fs');
var origRoot = process.cwd();

function mkdirp(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

// initial setup to make sure all dirs exist
mkdirp('dir1');
mkdirp('dir2');


function challenge1() {
  var startTime = Date.now();

  for (var i = 0; i < runCount; i++) {
    process.chdir('dir1');
    process.cwd();
    process.chdir(origRoot);
    process.cwd();
    process.chdir('dir2');
    process.cwd();
    process.chdir(origRoot);
  }

  return Date.now() - startTime;
}

function challenge2() {
  var startTime = Date.now();

  for (var i = 0; i < runCount; i++) {
    process.chdir('dir1');
    process.chdir(origRoot);
    process.chdir('dir2');
    process.chdir(origRoot);
  }

  return Date.now() - startTime;
}

var runCount = 100000;

console.log('Time with process.cwd:    ' + challenge1());
console.log('Time without process.cwd: ' + challenge2());
