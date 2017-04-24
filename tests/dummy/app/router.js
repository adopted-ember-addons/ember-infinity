import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('custom-store');
  this.route('demo', { path: '/' });
  this.route('demo-scrollable', { path: '/demo-scrollable' });
  this.route('home', { path: 'test' });
  this.route('test-scrollable', { path: '/test-scrollable' });
  this.route('test-window-scrollable', { path: '/test-window-scrollable' });
  this.route('category', { path: '/category/:category' });
  this.route('posts', function() {
    this.route('show', { path: '/:post' });
  });
});

export default Router;
