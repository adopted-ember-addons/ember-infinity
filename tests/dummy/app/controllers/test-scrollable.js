import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['triggerOffset', 'page', 'perPage'],
  triggerOffset: 0,
  page: 1,
  perPage: 25
});
