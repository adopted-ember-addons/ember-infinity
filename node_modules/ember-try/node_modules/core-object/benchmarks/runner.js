var Benchmark = require('benchmark');

function log(message) {
  if (typeof window !== 'undefined') {
    var div = document.createElement('div');
    div.textContent = message;
    document.body.appendChild(div);
  } else  {
    console.log(message);
  }
}

var setup = false;
var suite = new Benchmark.Suite();

var filter = process.argv[2];
if (filter) {
  filter = new RegExp(filter.replace('--filter=',''));
}

module.exports = function(run) {
  var suites = run.suites;

  var distribution = run.distribution || [1];

  log('testing: ' + run.name + ' [' + distribution + ']');

  suites.filter(function(s) {
    if (!filter) { return true; }

    return filter.test(s.name);
  }).forEach(function(s) {
    log(' - ' + s.name);
    distribution.forEach(function(d) {
 
      suite.add(s.name + ' (' + d + ') ', s.fn, {
        setup: s.setup,
        distribution: d
      });
    });
  });

  if (setup === false) {
    setup = true;
    suite.on('cycle', function(event) {
      log(String(event.target));
    })
    .on('error', function(event) {
      console.error(event.target.error.message);
      console.error(event.target.error.stack);
    })
    .on('complete', function() {
      log('Fastest is ' + this.filter('fastest').pluck('name'));
    });

    setTimeout(function() {
      log("running...");
      suite.run({
        'async': true
      });
    }, 100);
  }
}
