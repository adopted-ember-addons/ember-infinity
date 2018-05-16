import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';
import { inject as service } from '@ember/service';

export default Route.extend(InfinityRoute, {
  infinity: service(),

  model({ page, perPage }) {
    return this.infinity.model('post', { startingPage: page, perPage });
  }
});
