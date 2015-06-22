module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'ember-1.10',
      dependencies: {
        ember: '~1.10.0'
      }
    },
    {
      name: 'ember-1.11',
      dependencies: {
        ember: '~1.11.3'
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
      name: 'ember-release',
      dependencies: {
        ember: 'components/ember#release',
        'ember-data': '~2.0.0'
      },
      resolutions: {
        ember: 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        ember: 'components/ember#beta',
        'ember-data': '~2.0.0'
      },
      resolutions: {
        ember: 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        ember: 'components/ember#canary',
        'ember-data': '~2.0.0'
      },
      resolutions: {
        ember: 'canary'
      }
    }
  ]
};
