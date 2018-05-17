import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend(InfinityRoute, {
  infinity: service(),

  model({ page, perPage }) {
    return get(this, 'infinity').model('post', { startingPage: page, perPage });
  }
});
