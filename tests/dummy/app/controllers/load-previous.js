import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['triggerOffset', 'page'],
  triggerOffset: 0,
  page: 1
});
