import Ember from 'ember';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';

const InfinityLoaderComponent = Ember.Component.extend({
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModelContent.reachedInfinity"],
  guid: null,
  eventDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  hideOnInfinity: false,
  developmentMode: false,
  scrollable: null,
  triggerOffset: 0,
  isVisible: true,

  willInsertElement() {
    if (this.get('_isInfinityPromiseArray')) {
      Ember.defineProperty(this, 'infinityModelContent', Ember.computed.alias('infinityModel.content'));
    } else {
      Ember.defineProperty(this, 'infinityModelContent', Ember.computed.alias('infinityModel'));
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this._setupScrollable();
    this.set('guid', Ember.guidFor(this));
    this._bindEvent('scroll');
    this._bindEvent('resize');

    if (this.get('_isInfinityPromiseArray')) {
      this.get('infinityModel').then(() => this._loadMoreIfNeeded());
    } else {
      this._loadMoreIfNeeded();
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    this._unbindEvent('scroll');
    this._unbindEvent('resize');
  },

  _isInfinityPromiseArray: Ember.computed('infinityModel', function() {
    return (this.get('infinityModel') instanceof InfinityPromiseArray);
  }),

  _bindEvent(eventName) {
    this.get('_scrollable').on(`${eventName}.${this.get('guid')}`, () => {
      Ember.run.debounce(this, this._loadMoreIfNeeded, this.get('eventDebounce'));
    });
  },

  _unbindEvent(eventName) {
    let scrollable = this.get('_scrollable');
    if (scrollable) {
      scrollable.off(`${eventName}.${this.get('guid')}`);
    }
  },

  /**
   * determine how far the infinity-loader component is from the top of the
    scrollable element
   * @method _selfOffset
   * @return {Number}
   */
  _selfOffset() {
    if (this.get('_customScrollableIsDefined')) {
      return this.$().offset().top - this.get("_scrollable").offset().top + this.get("_scrollable").scrollTop();
    } else {
      return this.$().offset().top;
    }
  },

  /**
   * total pixels where _scrollable's bottom position is from top of screen
   * @method _bottomOfScrollableOffset
   * @return {Number}
   */
  _bottomOfScrollableOffset() {
    return this.get('_scrollable').height() + this.get("_scrollable").scrollTop();
  },

  /**
   * distance infinity loader is from top of _scrollable/window's top position
    less the buffer amount specified by triggerOffset
   * @method _triggerOffset
   * @return {Number}
   */
  _triggerOffset() {
    return this._selfOffset() - this.get('triggerOffset');
  },

  /**
   * is _scrollable's bottom position greater than the distance from the
    infinity-loader component to _scrollable's top
   * in other words if at top of page and _scrollable's height is 100px and
    infinity loader is 200px from the top, has the scrollable traversed 101px to trigger loading more records
   * @method _shouldLoadMore
   * @return {Boolean}
   */
  _shouldLoadMore() {
    const consideredReady = !this.get('_isInfinityPromiseArray') || this.get('infinityModel.isFulfilled');
    if (
      this.get('developmentMode') ||
      typeof FastBoot !== 'undefined' ||
      this.isDestroying ||
      this.isDestroyed ||
      !consideredReady
    ) {
      return false;
    }
    return this._bottomOfScrollableOffset() > this._triggerOffset();
  },

  _loadMoreIfNeeded() {
    const infinityModel = this.get('infinityModelContent');
    if (this._shouldLoadMore() && infinityModel) {
      this.sendAction('loadMoreAction', infinityModel);
    }
  },

  _setupScrollable() {
    var scrollable = this.get('scrollable');
    if (Ember.typeOf(scrollable) === 'string') {
      var items = Ember.$(scrollable);
      if (items.length === 1) {
        this.set('_scrollable', items.eq(0));
      } else if (items.length > 1) {
        throw new Ember.Error("Ember Infinity: Multiple scrollable elements found for: " + scrollable);
      } else {
        throw new Ember.Error("Ember Infinity: No scrollable element found for: " + scrollable);
      }
      this.set('_customScrollableIsDefined', true);
    } else if (scrollable === undefined || scrollable === null) {
      this.set('_scrollable', Ember.$(window));
      this.set('_customScrollableIsDefined', false);
    } else {
      throw new Ember.Error("Ember Infinity: Scrollable must either be a css selector string or left empty to default to window");
    }
  },

  loadedStatusDidChange: Ember.observer('infinityModelContent.reachedInfinity', 'hideOnInfinity', function () {
    if (this.get('infinityModelContent.reachedInfinity') && this.get('hideOnInfinity')) {
      this.set('isVisible', false);
    }
  }),

  infinityModelPushed: Ember.observer('infinityModelContent.length', function() {
    Ember.run.scheduleOnce('afterRender', this, this._loadMoreIfNeeded);
  })
});

export default InfinityLoaderComponent;
