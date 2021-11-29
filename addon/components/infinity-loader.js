import { cancel, debounce } from '@ember/runloop';
import { get, set, computed, defineProperty } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/infinity-loader';

const InfinityLoaderComponent = Component.extend({
  layout,

  infinity: service(),
  inViewport: service(),

  tagName: '',

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

  loaderClassNames: computed('classNames', function() {
    return 'infinity-loader '.concat(this.classNames).trim();
  }),

  init() {
    this._super(...arguments);

    defineProperty(this, 'infinityModelContent', computed('infinityModel', function() {
      return Promise.resolve(this.infinityModel);
    }));

    this.addObserver('infinityModel', this, this._initialInfinityModelSetup);
    this._initialInfinityModelSetup();

    this.addObserver('hideOnInfinity', this, this._loadStatusDidChange);
    this.addObserver('reachedInfinity', this, this._loadStatusDidChange);
  },

  /**
   * setup ember-in-viewport properties
   *
   * @method didInsertElement
   */
  didInsertLoader(element, [instance]) {
    /**
     * @public
     * @property loadingText
     */
    set(instance, 'loadingText', instance.loadingText || 'Loading Infinity Model...');
    /**
     * @public
     * @property loadedText
     */
    set(instance, 'loadedText', instance.loadedText || 'Infinity Model Entirely Loaded.');

    instance.elem = element;

    let options = {
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: instance.triggerOffset,
        left: 0
      },
      scrollableArea: instance.scrollable
    };
    const { onEnter, onExit } = instance.inViewport.watchElement(element, options);

    onEnter(instance.didEnterViewport.bind(instance));
    onExit(instance.didExitViewport.bind(instance));
  },

  willDestroy() {
    this._cancelTimers();

    get(this, 'infinityModelContent')
      .then((infinityModel) => {
        infinityModel.off('infinityModelLoaded', this, this._loadStatusDidChange.bind(this));
      });

    this.removeObserver('infinityModel', this, this._initialInfinityModelSetup);
    this.removeObserver('hideOnInfinity', this, this._loadStatusDidChange);
    this.removeObserver('reachedInfinity', this, this._loadStatusDidChange);
  },

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
   * @method didEnterViewport
   */
  didEnterViewport() {
    if (
      this.developmentMode ||
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
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        infinityModel.on('infinityModelLoaded', this._loadStatusDidChange.bind(this));
        set(infinityModel, '_scrollable', get(this, 'scrollable'));
        set(this, 'isDoneLoading', false);
        if (!get(this, 'hideOnInfinity')) {
          set(this, 'isVisible', true);
        }
        this._loadStatusDidChange();
      });
  },

  /**
   * @method _loadStatusDidChange
   */
  _loadStatusDidChange() {
    get(this, 'infinityModelContent')
      .then((infinityModel) => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

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
        this._debounceTimer = debounce(this, loadPreviousPage, content, get(this, 'eventDebounce'));
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
              if (get(content, 'canLoadMore')) {
                this._checkScrollableHeight();
              }
            });
        }
      });
    }
    this._debounceTimer = debounce(this, loadMore, get(this, 'eventDebounce'));
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
    if (this._viewportBottom() > this.elem.getBoundingClientRect().top) {
      // load again
      this._debounceScrolledToBottom();
    }
  },

  /**
   * @method _cancelTimers
   */
  _cancelTimers() {
    cancel(this._debounceTimer);
  },

  /**
    calculate the bottom of the viewport

    @private
    @method _viewportBottom
    @return Integer
   */
  _viewportBottom() {
    if (typeof FastBoot === 'undefined') {
      let isScrollable = !!this.scrollable;
      let viewportElem = isScrollable ? document.querySelector(this.scrollable) : window;
      return isScrollable ? viewportElem.getBoundingClientRect().bottom : viewportElem.innerHeight;
    }
  }
});

export default InfinityLoaderComponent;
