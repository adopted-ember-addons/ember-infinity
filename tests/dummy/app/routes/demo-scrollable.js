import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';
import Pretender from 'pretender';
import faker from 'faker';
import json from '../helpers/json';


function generateFakeData(qty) {
  var data = [];
  for (var i = 0; i < qty; i++) {
    data.push({id: i, name: faker.company.companyName()});
  }
  return data;
}


export default Ember.Route.extend(InfinityRoute, {
  init: function () {
    this._super(...arguments);
    var fakeData = generateFakeData(104);
    this.set('pretender', new Pretender());
    this.get('pretender').get('/posts', request => {
      var fd = fakeData;
      var page = parseInt(request.queryParams.page, 10);
      var per =  parseInt(request.queryParams.per_page, 10);
      var payload = {
        posts: fd.slice((page - 1) * per, Math.min((page) * per, fd.length)),
        meta: {
          total_pages: Math.ceil(fd.length/per)
        }
      };
      return json(200, payload);

    }, 500 /*ms*/);
  },

  tearDownPretender: Ember.observer('deactivate', function () {
    this.set('pretender', undefined);
  }),

  model() {
    return this.infinityModel('post');
  }
});
