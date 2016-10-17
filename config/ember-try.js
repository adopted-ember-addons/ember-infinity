/*jshint node:true*/
module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'ember-1.10',
      dependencies: {
        ember: '~1.10.0',
        'ember-data': '1.13.10'
      }
    },
    {
      name: 'ember-1.11',
      dependencies: {
        ember: '~1.11.3',
        'ember-data': '1.13.10'
      }
    },
    {
      name: 'ember-1.12',
      dependencies: {
        ember: '~1.12.0'
      }
    },
    {
      name: 'ember-1.13',
      dependencies: {
        ember: '~1.13.0'
      }
    },
    {
      name: 'ember-2.0',
      dependencies: {
        ember: '~2.0.0',
        'ember-data': '~2.0.0'
      }
    },
    {
      name: 'ember-2.1',
      dependencies: {
        ember: '~2.1.0',
        'ember-data': '~2.1.0'
      }
    },
    {
      name: 'ember-2.2',
      dependencies: {
        ember: '~2.2.0',
        'ember-data': '~2.2.0'
      }
    },
    {
      name: 'ember-2.3',
      dependencies: {
        ember: '~2.3.0',
        'ember-data': '~2.3.0'
      }
    },
    {
      name: 'ember-2.4',
      dependencies: {
        ember: '~2.4.0',
        'ember-data': '~2.4.0'
      }
    },
    {
      name: 'ember-2.5',
      dependencies: {
        ember: '~2.5.0',
        'ember-data': '~2.5.0'
      }
    },
    {
      name: 'ember-2.6',
      dependencies: {
        ember: '~2.6.0',
        'ember-data': '~2.6.0'
      }
    },
    {
      name: 'ember-2.7',
      dependencies: {
        ember: '~2.7.0',
        'ember-data': '~2.7.0'
      }
    },
    {
      name: 'ember-2.8',
      dependencies: {
        ember: '~2.8.0',
        'ember-data': '~2.8.0'
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        ember: 'release',
        'ember-data': 'release'
      }
    },
    {
      name: 'ember-release-ember-data-1.13.1x',
      dependencies: {
        ember: 'release',
        'ember-data': '~1.13.11'
      },
      resolutions: {
        ember: 'release',
        'ember-data': '~1.13.11'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        ember: 'beta',
        'ember-data': 'beta'
      },
      resolutions: {
        ember: 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        ember: 'canary',
        'ember-data': 'canary'
      },
      resolutions: {
        ember: 'canary'
      }
    }
  ]
};
