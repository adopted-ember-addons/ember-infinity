import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Pretender from 'pretender';
import { faker } from '@faker-js/faker';
import json from '../helpers/json';

function generateFakeData(qty) {
  let data = [];
  for (let i = 0; i < qty; i++) {
    data.push({ id: i, name: () => faker.company.name() });
  }
  return data;
}

export default class LoadPreviousRoute extends Route {
  @service infinity;

  constructor() {
    super(...arguments);
    const fakeData = generateFakeData(104);
    this.pretender = new Pretender();
    this.pretender.get(
      '/posts',
      (request) => {
        const fd = fakeData;
        const page = parseInt(request.queryParams.page, 10);
        const per = parseInt(request.queryParams.per_page, 10);
        const payload = {
          posts: fd.slice((page - 1) * per, Math.min(page * per, fd.length)),
          meta: {
            total_pages: Math.ceil(fd.length / per),
          },
        };
        return json(200, payload);
      },
      500 /*ms*/
    );
  }

  deactivate() {
    this.pretender = undefined;
  }

  model({ page }) {
    return this.infinity.model('post', { startingPage: page });
  }
}
