# Ember Faker

[![Build Status](https://travis-ci.org/johnotander/ember-faker.svg?branch=master)](https://travis-ci.org/johnotander/ember-faker)

Ember addon wrapper for [Faker.js](https://github.com/marak/Faker.js/).

## Installation

```javascript
ember install:addon ember-faker
```

## Usage

Import the faker module with `import faker from 'faker'`. Then you can use it as a default
value for dummy data:

```javascript
import faker from 'faker';

export default DS.Model.extend({
  firstName: DS.attr('string', {
    defaultValue: function() {
      return faker.name.firstName();
    }
  })
});
```

Or manually set attributes for tests or prototypes:

```javascript
import faker from 'faker';

// ...

user.set('firstName', faker.name.firstName());
user.set('lastName', faker.name.lastName());
```

## Environment options

By default faker is included into your build for non-production
environments. To include it in production, add this
to your config:

```js
// config/environment.js
if (environment === 'production') {
  ENV['ember-faker'] = {
    enabled: true
  };
}
```

## Development

### Installation

* `git clone` this repository
* `npm install`
* `bower install`

### Running

* `ember server`
* Visit your app at http://localhost:4200.

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## License

MIT

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Thanks to the following

* [Faker.js](https://github.com/marak/Faker.js/) for the fake data.
* [ember-cli-pretender](https://github.com/rwjblue/ember-cli-pretender) for the shim example.

Crafted with <3 by [John Otander](http://johnotander.com) ([@4lpine](https://twitter.com/4lpine)).
