import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  name: faker.address.country
});
