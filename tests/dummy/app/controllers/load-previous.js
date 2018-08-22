import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['triggerOffset', 'page'],
  triggerOffset: 50,
  page: 1
});
