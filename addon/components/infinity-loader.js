import Ember from 'ember';
import layout from '../templates/components/infinity-loader';

export default Ember.Component.extend({
  layout: layout,
  classNames: ["infinity-loader"],
  classNameBindings: ["infiniteModel.reachedInfinity"],
  guid: null,
  scrollDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  destroyOnInfinity: false,
  developmentMode: false,

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
    Ember.$(window).on("scroll."+this.get('guid'), function() {
      Ember.run.debounce(_this, _this._checkIfInView, _this.get('scrollDebounce'));
    });
  },

  _unbindScroll: function() {
    Ember.$(window).off("scroll."+this.get('guid'));
  },

  _checkIfInView: function() {
    var selfOffset   = this.$().offset().top;
    var windowBottom = Ember.$(window).height() + Ember.$(window).scrollTop();

    var inView = selfOffset < windowBottom ? true : false;

    if (inView && !this.get('developmentMode')) {
      this.sendAction('loadMoreAction');
    }
  },

  loadedStatusDidChange: Ember.observer('infiniteModel.reachedInfinity', function() {
    if (this.get('infiniteModel.reachedInfinity') && this.get('destroyOnInfinity')) { this.destroy(); }
  })
});
