import Ember from 'ember';
import layout from '../templates/components/infinity-loader';

export default Ember.Component.extend({
  layout: layout,
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModel.reachedInfinity"],
  guid: null,
  scrollDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  destroyOnInfinity: false,
  developmentMode: false,
  scrollable: window,

  didInsertElement: function() {
    this.set('guid', Ember.guidFor(this));
    this._bindScroll();
    this._checkIfInView();
  },

  willDestroyElement: function() {
    this._unbindScroll();
  },

  _bindScroll: function() {
    var _this = this;
    Ember.$(this.get("scrollable")).on("scroll."+this.get('guid'), function() {
      Ember.run.debounce(_this, _this._checkIfInView, _this.get('scrollDebounce'));
    });
  },

  _unbindScroll: function() {
    Ember.$(this.get("scrollable")).off("scroll."+this.get('guid'));
  },

  _checkIfInView: function() {
    var selfOffset   = this.$().offset().top;
    var scrollableBottom = Ember.$(this.get("scrollable")).height() + Ember.$(this.get("scrollable")).scrollTop();

    var inView = selfOffset < scrollableBottom ? true : false;

    if (inView && !this.get('developmentMode')) {
      this.sendAction('loadMoreAction');
    }
  },

  loadedStatusDidChange: Ember.observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function() {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) { this.destroy(); }
  })
});
