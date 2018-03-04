import Route from '@ember/routing/route';
import InfinityRoute from 'ember-infinity/mixins/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import Pretender from 'pretender';
import faker from 'faker';
import json from '../helpers/json';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

const ExtendedInfinityModel =  InfinityModel.extend({
  buildParams() {
    let params = this._super(...arguments);
    debugger;
    params['categoryId'] = get(this, 'global').categoryId;
    return params;
  }
});

function generateFakeData(qty) {
  let data = [];
  for (let i = 0; i < qty; i++) {
    data.push({id: i, name: faker.company.companyName()});
  }
  return data;
}


export default Route.extend(InfinityRoute, {
  global: service(),

  init() {
    this._super(...arguments);
    let fakeData = generateFakeData(104);
    set(this, 'pretender', new Pretender());
    get(this, 'pretender').get('/posts', request => {
      let fd = fakeData;
      let page = parseInt(request.queryParams.page, 10);
      let per =  parseInt(request.queryParams.per_page, 10);
      let payload = {
        posts: fd.slice((page - 1) * per, Math.min((page) * per, fd.length)),
        meta: {
          total_pages: Math.ceil(fd.length/per)
        }
      };
      return json(200, payload);

    }, 500 /*ms*/);
  },

  deactivate() {
    set(this, 'pretender', undefined);
  },

  model() {
    let global = get(this, 'global');
    return this.infinityModel(
      'post',
      {},
      ExtendedInfinityModel.extend({ global })
    )
  }
});
