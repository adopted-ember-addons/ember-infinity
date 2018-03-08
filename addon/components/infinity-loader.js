import { alias } from '@ember/object/computed';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import InViewportMixin from 'ember-in-viewport';
import { computed, observer, defineProperty } from '@ember/object';
import Component from '@ember/component';

const InfinityLoaderComponent = Component.extend(InViewportMixin, {
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModelContent.reachedInfinity", "viewportEntered:in-viewport"],
  eventDebounce: 50,
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
        bottom: this.get('triggerOffset'),
        left: 0
      },
      scrollableArea: this.get('scrollable'),
    });
  },

  willDestroyElement() {
    this._super(...arguments);
  },

  _isInfinityPromiseArray: computed('infinityModel', function() {
    return (this.get('infinityModel') instanceof InfinityPromiseArray);
  }),

  /**
   * https://github.com/DockYard/ember-in-viewport#didenterviewport-didexitviewport
   *
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

    this.sendAction('loadMoreAction', this.get('infinityModelContent'));
  },

  /**
   * @method loadedStatusDidChange
   */
  loadedStatusDidChange: observer('infinityModelContent.reachedInfinity', 'hideOnInfinity', function () {
    if (this.get('infinityModelContent.reachedInfinity') && this.get('hideOnInfinity')) {
      this.set('isVisible', false);
    }
  }),
});

export default InfinityLoaderComponent;
