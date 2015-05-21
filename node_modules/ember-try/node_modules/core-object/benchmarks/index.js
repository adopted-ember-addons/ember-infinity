require('./runner')(
  {
    distribution: [0, 1, 5],
    name: 'create',
    suites: [
      require('./create/core'),
      require('./create/core-default-init'),
      require('./create/uberproto'),
      require('./create/raw'),
      require('./create/esnext'),
      require('./create/klass'),
      require('./create/backbone-metal'),
    ]
  }
);

require('./runner')(
  {
    distribution: [1, 5],
    name: 'extend',
    suites: [
      require('./extend/core'),
      require('./extend/uberproto'),
      require('./extend/klass'),
      require('./extend/backbone-metal'),
    ]
  }
);
