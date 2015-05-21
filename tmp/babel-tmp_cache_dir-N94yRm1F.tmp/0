import Ember from 'ember';
import layout from '../templates/components/infinity-loader';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['infinity-loader'],
  classNameBindings: ['infinityModel.reachedInfinity'],
  guid: null,
  scrollDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  destroyOnInfinity: false,
  developmentMode: false,
  scrollable: null,

  didInsertElement: function didInsertElement() {
    this._super.apply(this, arguments);
    this._setupScrollable();
    this.set('guid', Ember.guidFor(this));
    this._bindScroll();
    this._checkIfInView();
  },

  willDestroyElement: function willDestroyElement() {
    this._super.apply(this, arguments);
    this._unbindScroll();
  },

  _bindScroll: function _bindScroll() {
    var _this = this;

    this.get('scrollable').on('scroll.' + this.get('guid'), function () {
      Ember.run.debounce(_this, _this._checkIfInView, _this.get('scrollDebounce'));
    });
  },

  _unbindScroll: function _unbindScroll() {
    this.get('scrollable').off('scroll.' + this.get('guid'));
  },

  _checkIfInView: function _checkIfInView() {
    var selfOffset = this.$().offset().top;
    var scrollable = this.get('scrollable');
    var scrollableBottom = scrollable.height() + scrollable.scrollTop();

    var inView = selfOffset < scrollableBottom;

    if (inView && !this.get('developmentMode')) {
      this.sendAction('loadMoreAction');
    }
  },

  _setupScrollable: function _setupScrollable() {
    var scrollable = this.get('scrollable');
    if (Ember.typeOf(scrollable) === 'string') {
      var items = Ember.$(scrollable);
      if (items.length === 1) {
        this.set('scrollable', items.eq(0));
      } else if (items.length > 1) {
        throw new Error('Multiple scrollable elements found for: ' + scrollable);
      } else {
        throw new Error('No scrollable element found for: ' + scrollable);
      }
    } else {
      this.set('scrollable', Ember.$(window));
    }
  },

  loadedStatusDidChange: Ember.observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
      this.destroy();
    }
  })
});