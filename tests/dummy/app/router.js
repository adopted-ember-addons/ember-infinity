import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('demo', { path: '/' });
  this.route('demo-scrollable', { path: '/demo-scrollable' });
  this.route('home', { path: 'test' });
  this.route('test-scrollable', { path: '/test-scrollable' });
  this.route('category', { path: '/category/:category' });
  this.resource('posts', function() {
    this.route('show', { path: '/:post' });
  });
});

export default Router;
