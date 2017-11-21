import Ember from 'ember';
import InfinityPromiseArray from 'ember-infinity/lib/infinity-promise-array';
import InViewportMixin from 'ember-in-viewport';
import { run } from '@ember/runloop';
import { computed, observer } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@ember/component';

const InfinityLoaderComponent = Component.extend(InViewportMixin, {
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModelContent.reachedInfinity", "viewportEntered:in-viewport"],
  guid: null,
  eventDebounce: 10,
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  hideOnInfinity: false,
  developmentMode: false,
  triggerOffset: 0,
  isVisible: true,

  willInsertElement() {
    if (this.get('_isInfinityPromiseArray')) {
      Ember.defineProperty(this, 'infinityModelContent', computed.alias('infinityModel.content'));
    } else {
      Ember.defineProperty(this, 'infinityModelContent', computed.alias('infinityModel'));
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.set('guid', guidFor(this));

    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        top: 0,
        right: 0,
        bottom: this.get('triggerOffset'),
        left: 0
      }
    });
  },

  willDestroyElement() {
    this._super(...arguments);
    this._cancelTimers();
  },

  _isInfinityPromiseArray: computed('infinityModel', function() {
    return (this.get('infinityModel') instanceof InfinityPromiseArray);
  }),

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

  infinityModelPushed: observer('infinityModelContent.length', 'viewportEntered', function() {
    if (this.get('viewportEntered')) {
      run.scheduleOnce('afterRender', this, this._scheduleScrolledToBottom);
    }
  })
});

export default InfinityLoaderComponent;
