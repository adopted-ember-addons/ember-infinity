import Ember from 'ember';
import emberVersionIs from 'ember-version-is';
import InViewportMixin from 'ember-in-viewport';

const {
  on,
  guidFor,
  observer,
  computed
} = Ember;

const InfinityLoaderComponent = Ember.Component.extend(InViewportMixin, {
  classNames: ['infinity-loader'],
  classNameBindings: ['infinityModel.reachedInfinity', 'viewportEntered:in-viewport'],
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  destroyOnInfinity: false,
  developmentMode: false,
  triggerOffset: 0,

  guid: computed(function() {
    return guidFor(this);
  }).readOnly(),

  setupViewportOptions: on('didInsertElement', function() {
    this.setProperties({
      viewportSpy: true,
      viewportTolerance: {
        bottom : this.get('triggerOffset'),
        top    : 0,
        left   : 0,
        right  : 0
      }
    });
  }),

  didEnterViewport() {
    if(!this.get('infinityModel.reachedInfinity') && !this.get('developmentMode')) {
      this.sendAction('loadMoreAction');
    }
  },

  destroyWhenReachedInfinity: observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
      this.destroy();
    }
  })
});

if (emberVersionIs('lessThan', '1.13.0')) {
  InfinityLoaderComponent.reopen({
    hasBlock: Ember.computed.alias('template')
  });
}

export default InfinityLoaderComponent;
