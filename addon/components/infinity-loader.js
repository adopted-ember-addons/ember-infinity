import InViewportMixin from 'ember-in-viewport';
import { run } from '@ember/runloop';
import { get, set, computed, defineProperty } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

const InfinityLoaderComponent = Component.extend(InViewportMixin, {
  infinity: service(),

  classNames: ['infinity-loader'],
  classNameBindings: ['isDoneLoading:reached-infinity', 'viewportEntered:in-viewport'],
  attributeBindings: ['data-test-infinity-loader'],
  'data-test-infinity-loader': true,

  /**
   * @public
   * @property eventDebounce
   * @default 50
   */
  eventDebounce: 50,
  /**
   * @public
   * @property loadingText
   */
  loadingText: 'Loading Infinity Model...',
  /**
   * @public
   * @property loadedText
   */
  loadedText: 'Infinity Model Entirely Loaded.',
  /**
   * @public
   * @property hideOnInfinity
   * @default false
   */
  hideOnInfinity: false,
  /**
   * @public
   * @property isDoneLoading
   * @default false
   */
  isDoneLoading: false,
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

  init() {
    this._super(...arguments);

    let scrollableArea = get(this, 'scrollable');
    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: get(this, 'triggerOffset'),
        left: 0
      },
      scrollableArea
    });
  },

  willInsertElement() {
    defineProperty(this, 'infinityModelContent', computed('infinityModel', function() {
      return resolve(get(this, 'infinityModel'));
    }));

    this.addObserver('infinityModel', this, this._initialInfinityModelSetup);
  },

  /**
   * setup ember-in-viewport properties
   *
   * @method didInsertElement
   */
  didInsertElement() {
    this._super(...arguments);

    this._loadStatusDidChange();

    this._initialInfinityModelSetup();

    this.addObserver('hideOnInfinity', this, this._loadStatusDidChange);
  },

  willDestroyElement() {
    this._super(...arguments);

    this._cancelTimers();

    get(this, 'infinityModelContent')
      .then((infinityModel) => {
        infinityModel.off('infinityModelLoaded', this, this._loadStatusDidChange);
      });

    this.removeObserver('infinityModel', this, this._initialInfinityModelSetup);
    this.removeObserver('hideOnInfinity', this, this._loadStatusDidChange);
  },

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
   * @method didEnterViewport
   */
  didEnterViewport() {
    if (
      get(this, 'developmentMode') ||
      typeof FastBoot !== 'undefined' ||
      this.isDestroying ||
      this.isDestroyed
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
   * @method _initialInfinityModelSetup
   */
  _initialInfinityModelSetup() {
    get(this, 'infinityModelContent')
      .then((infinityModel) => {
        infinityModel.on('infinityModelLoaded', this, this._loadStatusDidChange);
        set(infinityModel, '_scrollable', get(this, 'scrollable'));
        set(this, 'isDoneLoading', false);
        if (!get(this, 'hideOnInfinity')) {
          set(this, 'isVisible', true);
        }
      });
  },

  /**
   * @method _loadStatusDidChange
   */
  _loadStatusDidChange() {
    get(this, 'infinityModelContent')
      .then((infinityModel) => {
        if (get(infinityModel, 'reachedInfinity')) {
          set(this, 'isDoneLoading', true);

          if (get(this, 'hideOnInfinity')) {
            set(this, 'isVisible', false);
          }
        } else {
          set(this, 'isVisible', true);
        }
      });
  },

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
    function loadPreviousPage(content) {
      if (typeof(get(this, 'infinityLoad')) === 'function') {
        // closure action
        return get(this, 'infinityLoad')(content, -1);
      } else {
        get(this, 'infinity').infinityLoad(content, -1)
      }
    }

    get(this, 'infinityModelContent').then((content) => {
      if (get(content, 'firstPage') > 1 && get(content, 'currentPage') > 0) {
        this._debounceTimer = run.debounce(this, loadPreviousPage, content, get(this, 'eventDebounce'));
      }
    })
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
      // resolve to create thennable
      // type is <InfinityModel|Promise|null>
      get(this, 'infinityModelContent').then((content) => {
        if (typeof(get(this, 'infinityLoad')) === 'function') {
          // closure action (if you need to perform some other logic)
          return get(this, 'infinityLoad')(content);
        } else {
          // service action
          get(this, 'infinity').infinityLoad(content, 1)
            .then(() => {
              if (get(content, '_canLoadMore')) {
                this._checkScrollableHeight();
              }
            });
        }
      });
    }
    this._debounceTimer = run.debounce(this, loadMore, get(this, 'eventDebounce'));
  },

  /**
   * recursive function to fill page with records
   *
   * @method _checkScrollableHeight
   */
  _checkScrollableHeight() {
    if (this.isDestroying || this.isDestroyed) {
      return false;
    }
    if (this._viewportHeight() > this.element.offsetTop) {
      // load again
      this._debounceScrolledToBottom();
    }
  },

  /**
   * @method _cancelTimers
   */
  _cancelTimers() {
    run.cancel(this._debounceTimer);
  },

  /**
    calculate the height of the viewport

    @private
    @method _viewportHeight
    @return Integer
   */
  _viewportHeight() {
    if (typeof FastBoot === 'undefined') {
      let isScrollable = !!this.scrollable;
      let viewportElem = isScrollable ? document.querySelector(this.scrollable) : window;
      return isScrollable ? viewportElem.clientHeight : viewportElem.innerHeight;
    }
  }
});

export default InfinityLoaderComponent;
