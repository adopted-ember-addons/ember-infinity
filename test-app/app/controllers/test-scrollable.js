import Controller from '@ember/controller';

export default class TestScrollableController extends Controller {
  queryParams = ['triggerOffset', 'page', 'perPage'];
  triggerOffset = 50;
  page = 1;
  perPage = 25;
}
