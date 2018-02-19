import { alias } from '@ember/object/computed';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import InViewportMixin from 'ember-in-viewport';
import { run } from '@ember/runloop';
import { get, set, computed, observer, defineProperty } from '@ember/object';
import Component from '@ember/component';

const InfinityLoaderComponent = Component.extend(InViewportMixin, {
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModelContent.reachedInfinity", "viewportEntered:in-viewport"],
  /**
   * @public
   * @property eventDebounce
   * @default 50
   */
  eventDebounce: 50,
  /**
   * sent up to route mixin to load next page
   *
   * @public
   * @property loadMoreAction
   * @default
   */
  loadMoreAction: 'infinityLoad',
  /**
   * sent up to route mixin to load previous page
   *
   * @public
   * @property loadPreviousAction
   * @default
   */
  loadPreviousAction: 'infinityLoad',
  /**
   * @public
   * @property loadingText
   */
  loadingText: 'Loading Infinite Model...',
  /**
   * @public
   * @property loadedText
   */
  loadedText: 'Infinite Model Entirely Loaded.',
  /**
   * @public
   * @property hideOnInfinity
   * @default false
   */
  hideOnInfinity: false,
  /**
   * @public
   * @property developmentMode
   * @default false
   */
  developmentMode: false,
  /**
   * indicate to infinity-loader to load previous page
   *
   * @public
   * @property loadPrevious
   * @default false
   */
  loadPrevious: false,
  /**
   * set if have scrollable area
   *
   * @public
   * @property scrollable
   */
  scrollable: null,
  /**
   * offset from bottom of target and viewport
   *
   * @public
   * @property triggerOffset
   * @defaul 0
   */
  triggerOffset: 0,
  /**
   * https://emberjs.com/api/ember/3.0/classes/Component/properties/isVisible?anchor=isVisible
   *
   * @property isVisible
   */
  isVisible: true,

  willInsertElement() {
    if (get(this, '_isInfinityPromiseArray')) {
      defineProperty(this, 'infinityModelContent', alias('infinityModel.content'));
    } else {
      defineProperty(this, 'infinityModelContent', alias('infinityModel'));
    }
  },

  /**
   * setup ember-in-viewport properties
   *
   * @method didInsertElement
   */
  didInsertElement() {
    this._super(...arguments);

    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: get(this, 'triggerOffset'),
        left: 0
      },
      scrollableArea: get(this, 'scrollable'),
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    this._cancelTimers();
  },

  _isInfinityPromiseArray: computed('infinityModel', function() {
    return (get(this, 'infinityModel') instanceof InfinityPromiseArray);
  }),

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
   * @method didEnterViewport
   */
  didEnterViewport() {
    const consideredReady = !get(this, '_isInfinityPromiseArray') || get(this, 'infinityModel.isFulfilled');
    if (
      get(this, 'developmentMode') ||
      typeof FastBoot !== 'undefined' ||
      this.isDestroying ||
      this.isDestroyed ||
      !consideredReady
    ) {
      return false;
    }

    if (get(this, 'loadPrevious')) {
      return this._debounceScrolledToTop();
    }
    return this._debounceScrolledToBottom();
  },

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
   * @method didExitViewport
   */
  didExitViewport() {
    this._cancelTimers();
  },

  /**
   * @method loadedStatusDidChange
   */
  loadedStatusDidChange: observer('infinityModelContent.reachedInfinity', 'hideOnInfinity', function () {
    if (get(this, 'infinityModelContent.reachedInfinity') && get(this, 'hideOnInfinity')) {
      set(this, 'isVisible', false);
    }
  }),

  /**
   * only load previous page if route started on a page greater than 1 && currentPage is > 0
   *
   * @method _debounceScrolledToTop
   */
  _debounceScrolledToTop() {
    /*
     This debounce is needed when there is not enough delay between onScrolledToBottom calls.
     Without this debounce, all rows will be rendered causing immense performance problems
     */
    const infinityModelContent = get(this, 'infinityModelContent');

    function loadPreviousPage() {
      this.sendAction('loadPreviousAction', infinityModelContent, -1);
    }

    if (get(infinityModelContent, 'firstPage') > 1 && get(infinityModelContent, 'currentPage') > 0) {
      this._debounceTimer = run.debounce(this, loadPreviousPage, get(this, 'eventDebounce'));
    }
  },

  /**
   * @method _debounceScrolledToBottom
   */
  _debounceScrolledToBottom() {
    /*
     This debounce is needed when there is not enough delay between onScrolledToBottom calls.
     Without this debounce, all rows will be rendered causing immense performance problems
     */
    function loadMore() {
      this.sendAction('loadMoreAction', get(this, 'infinityModelContent'));
    }
    this._debounceTimer = run.debounce(this, loadMore, get(this, 'eventDebounce'));
  },

  _cancelTimers() {
    run.cancel(this._debounceTimer);
  },
});

export default InfinityLoaderComponent;
