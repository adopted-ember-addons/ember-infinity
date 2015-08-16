import Ember from 'ember';
import emberVersionIs from 'ember-version-is';

const InfinityLoaderComponent = Ember.Component.extend({
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModel.reachedInfinity"],
  guid: null,
  eventDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  destroyOnInfinity: false,
  developmentMode: false,
  scrollable: null,

  didInsertElement() {
    this._super(...arguments);
    this._setupScrollable();
    this.set('guid', Ember.guidFor(this));
    this._bindEvent('scroll');
    this._bindEvent('resize');
    this._checkIfInView();
  },

  willDestroyElement() {
    this._super(...arguments);
    this._unbindEvent('scroll');
    this._unbindEvent('resize');
  },

  _bindEvent(eventName) {
    this.get('_scrollable').on(`${eventName}.${this.get('guid')}`, () => {
      Ember.run.debounce(this, this._checkIfInView, this.get('eventDebounce'));
    });
  },

  _unbindEvent(eventName) {
    this.get('_scrollable').off(`${eventName}.${this.get('guid')}`);
  },

  _checkIfInView() {
    var selfOffset       = this.$().offset().top;
    var scrollable       = this.get("_scrollable");
    var scrollableBottom = scrollable.height() + scrollable.scrollTop();

    var inView = selfOffset < scrollableBottom;

    if (inView && !this.get('developmentMode')) {
      this.sendAction('loadMoreAction');
    }
  },

  _setupScrollable() {
    var scrollable = this.get('scrollable');
    if (Ember.typeOf(scrollable) === 'string') {
      var items = Ember.$(scrollable);
      if (items.length === 1) {
        this.set('_scrollable', items.eq(0));
      } else if (items.length > 1) {
        throw new Error("Ember Infinity: Multiple scrollable elements found for: " + scrollable);
      } else {
        throw new Error("Ember Infinity: No scrollable element found for: " + scrollable);
      }
    } else if (scrollable === undefined || scrollable === null) {
      this.set('_scrollable', Ember.$(window));
    } else {
      throw new Error("Ember Infinity: Scrollable must either be a css selector string or left empty to default to window");
    }
  },

  loadedStatusDidChange: Ember.observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
      this.destroy();
    }
  }),

  infinityModelPushed: Ember.observer('infinityModel.length', function() {
    Ember.run.scheduleOnce('afterRender', this, this._checkIfInView);
  })
});

if (emberVersionIs('lessThan', '1.13.0')) {
  InfinityLoaderComponent.reopen({
    hasBlock: Ember.computed.alias('template')
  });
}

export default InfinityLoaderComponent;
