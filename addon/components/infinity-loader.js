import Ember from 'ember';

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
  triggerOffset: 0,

  didInsertElement(){
    Ember.run.schedule('routerTransitions', this, ()  =>  this.setupElement());
  },
  setupElement() {
    this._super(...arguments);
    this._setupScrollable();
    this.set('guid', Ember.guidFor(this));
    this._bindEvent('scroll');
    this._bindEvent('resize');
    this._loadMoreIfNeeded();
  },

  willDestroyElement() {
    this._super(...arguments);
    this._unbindEvent('scroll');
    this._unbindEvent('resize');
  },

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
    if (this.get('developmentMode') || typeof FastBoot !== 'undefined' || this.isDestroying || this.isDestroyed) {
      return false;
    }

    return this._bottomOfScrollableOffset() > this._triggerOffset();
  },

  _loadMoreIfNeeded() {
    if (this._shouldLoadMore()) {
      this.sendAction('loadMoreAction', this.get('infinityModel'));
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

  loadedStatusDidChange: Ember.observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
      this.destroy();
    }
  }),

  infinityModelPushed: Ember.observer('infinityModel.length', function() {
    Ember.run.scheduleOnce('afterRender', this, this._loadMoreIfNeeded);
  })
});

export default InfinityLoaderComponent;
