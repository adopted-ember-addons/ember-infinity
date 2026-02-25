import Controller from '@ember/controller';

export default class LoadPreviousController extends Controller {
  queryParams = ['triggerOffset', 'page'];
  triggerOffset = 50;
  page = 1;
}
