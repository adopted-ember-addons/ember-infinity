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
  triggerOffset: 0,
  loadPrevious: false,

  didInsertElement() {
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

  _selfOffset() {
    if (this.get('_customScrollableIsDefined')) {
      return this.$().offset().top - this.get("_scrollable").offset().top + this.get("_scrollable").scrollTop();
    } else {
      return this.$().offset().top;
    }
  },

  _bottomOfScrollableOffset() {
    return this.get('_scrollable').height() + this.get("_scrollable").scrollTop();
  },

  _triggerOffset() {
    return this._selfOffset() - this.get('triggerOffset');
  },

  _scrollableHeight() {
    return this.get('_scrollable')[0].scrollHeight || document.documentElement.scrollHeight;
  },

  _shouldLoadMore() {
    if (this.get('developmentMode') || typeof FastBoot !== 'undefined' || this.isDestroying || this.isDestroyed) {
      return false;
    }

    var scrolledBelowTrigger = this._bottomOfScrollableOffset() > this._triggerOffset();

    if (scrolledBelowTrigger && this.get('loadPrevious')) {
      var scrollable = this.get('_scrollable'),
          scrollableScrollTop = scrollable.scrollTop(),
          scrollableHeight = scrollable.height(),
          offsetTop = this._selfOffset();

      return (
        offsetTop > scrollableScrollTop &&
        offsetTop < scrollableScrollTop + scrollableHeight
      );
    }

    return scrolledBelowTrigger;
  },

  _loadMoreIfNeeded() {
    if (this._shouldLoadMore()) {
      this.sendAction('loadMoreAction', this.get('infinityModel'), this.get('loadPrevious'));
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

  _updateScrollPosition(oldScrollableHeight) {
    var scrollable = this.get('_scrollable'),
        newScrollableHeight = this._scrollableHeight();

    scrollable.scrollTop(scrollable.scrollTop() + (newScrollableHeight - oldScrollableHeight));
  },

  loadedStatusDidChange: Ember.observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
      this.destroy();
    }
  }),

  infinityModelPushed: Ember.observer('infinityModel.length', function() {
    if (this.get('loadPrevious')) {
      var oldScrollableHeight = this._scrollableHeight();

      Ember.run.scheduleOnce('afterRender', this, function() {
        this._updateScrollPosition(oldScrollableHeight);
      });
    }

    Ember.run.scheduleOnce('afterRender', this, this._loadMoreIfNeeded);
  })
});

if (emberVersionIs('lessThan', '1.13.0')) {
  InfinityLoaderComponent.reopen({
    hasBlock: Ember.computed.alias('template')
  });
}

export default InfinityLoaderComponent;
