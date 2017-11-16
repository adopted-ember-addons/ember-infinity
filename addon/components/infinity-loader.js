import Ember from 'ember';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import InViewportMixin from 'ember-in-viewport';

const { run } = Ember;

const InfinityLoaderComponent = Ember.Component.extend(InViewportMixin, {
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModelContent.reachedInfinity", "viewportEntered:in-viewport"],
  guid: null,
  eventDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  hideOnInfinity: false,
  developmentMode: false,
  // scrollable: null,
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
    // this._setupScrollable();
    this.set('guid', Ember.guidFor(this));
    // this._bindEvent('scroll');
    // this._bindEvent('resize');

    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: this.get('triggerOffset'),
        left: 0
      }
    });

    // if (this.get('_isInfinityPromiseArray')) {
    //   this.get('infinityModel').then(() => this._loadMoreIfNeeded());
    // } else {
    //   this._loadMoreIfNeeded();
    // }
  },

  willDestroyElement() {
    this._super(...arguments);
    this._cancelTimers();
  },

  _isInfinityPromiseArray: Ember.computed('infinityModel', function() {
    return (this.get('infinityModel') instanceof InfinityPromiseArray);
  }),

  // _bindEvent(eventName) {
  //   this.get('_scrollable').on(`${eventName}.${this.get('guid')}`, () => {
  //     Ember.run.debounce(this, this._loadMoreIfNeeded, this.get('eventDebounce'));
  //   });
  // },

  // _unbindEvent(eventName) {
  //   let scrollable = this.get('_scrollable');
  //   if (scrollable) {
  //     scrollable.off(`${eventName}.${this.get('guid')}`);
  //   }
  // },

  // /**
  //  * determine how far the infinity-loader component is from the top of the
  //   scrollable element
  //  * @method _selfOffset
  //  * @return {Number}
  //  */
  // _selfOffset() {
  //   if (this.get('_customScrollableIsDefined')) {
  //     return this.$().offset().top - this.get("_scrollable").offset().top + this.get("_scrollable").scrollTop();
  //   } else {
  //     return this.$().offset().top;
  //   }
  // },

  // /**
  //  * total pixels where _scrollable's bottom position is from top of screen
  //  * @method _bottomOfScrollableOffset
  //  * @return {Number}
  //  */
  // _bottomOfScrollableOffset() {
  //   return this.get('_scrollable').height() + this.get("_scrollable").scrollTop();
  // },

  // /**
  //  * distance infinity loader is from top of _scrollable/window's top position
  //   less the buffer amount specified by triggerOffset
  //  * @method _triggerOffset
  //  * @return {Number}
  //  */
  // _triggerOffset() {
  //   return this._selfOffset() - this.get('triggerOffset');
  // },

  /**
   * @method didEnterViewport
   */
  didEnterViewport() {
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

    this._debounceScrolledToBottom();
  },

  didExitViewport() {
    this._cancelTimers();
  },

  // scheduleScrolledToBottom: observer('rows.[]', 'viewportEntered', function() {
  //   if (this.get('viewportEntered')) {
  //     /*
  //      Continue scheduling onScrolledToBottom until no longer in viewport
  //      */
  //     this._scheduleScrolledToBottom();
  //   }
  // }),

  _scheduleScrolledToBottom() {
    this._schedulerTimer = run.scheduleOnce('afterRender', this, this._debounceScrolledToBottom);
  },

<<<<<<< HEAD
  loadedStatusDidChange: Ember.observer('infinityModelContent.reachedInfinity', 'hideOnInfinity', function () {
    if (this.get('infinityModelContent.reachedInfinity') && this.get('hideOnInfinity')) {
      this.set('isVisible', false);
=======
  _debounceScrolledToBottom() {
    /*
     This debounce is needed when there is not enough delay between onScrolledToBottom calls.
     Without this debounce, all rows will be rendered causing immense performance problems
     */
    function loadMore() {
      this.sendAction('loadMoreAction', this.get('infinityModelContent'));
>>>>>>> 0cb6683e... Replace binding to window with ember-in-viewport
    }
    this._debounceTimer = run.debounce(this, loadMore, this.get('eventDebounce'));
  },

  _cancelTimers() {
    run.cancel(this._schedulerTimer);
    run.cancel(this._debounceTimer);
  },

  // _loadMoreIfNeeded() {
  //   const infinityModel = this.get('infinityModelContent');
  //   if (this._shouldLoadMore() && infinityModel) {
  //   }
  // },

  // _setupScrollable() {
  //   var scrollable = this.get('scrollable');
  //   if (Ember.typeOf(scrollable) === 'string') {
  //     var items = Ember.$(scrollable);
  //     if (items.length === 1) {
  //       this.set('_scrollable', items.eq(0));
  //     } else if (items.length > 1) {
  //       throw new Ember.Error("Ember Infinity: Multiple scrollable elements found for: " + scrollable);
  //     } else {
  //       throw new Ember.Error("Ember Infinity: No scrollable element found for: " + scrollable);
  //     }
  //     this.set('_customScrollableIsDefined', true);
  //   } else if (scrollable === undefined || scrollable === null) {
  //     this.set('_scrollable', Ember.$(window));
  //     this.set('_customScrollableIsDefined', false);
  //   } else {
  //     throw new Ember.Error("Ember Infinity: Scrollable must either be a css selector string or left empty to default to window");
  //   }
  // },

  // loadedStatusDidChange: Ember.observer('infinityModelContent.reachedInfinity', 'destroyOnInfinity', function () {
  //   if (this.get('infinityModelContent.reachedInfinity') && this.get('destroyOnInfinity')) {
  //     this.destroy();
  //   }
  // }),

  infinityModelPushed: Ember.observer('infinityModelContent.length', 'viewportEntered', function() {
    if (this.get('viewportEntered')) {
      Ember.run.scheduleOnce('afterRender', this, this._scheduleScrolledToBottom);
    }
  })
});

export default InfinityLoaderComponent;
