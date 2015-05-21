define('ember-infinity/components/infinity-loader', ['exports', 'ember', 'ember-infinity/templates/components/infinity-loader'], function (exports, Ember, layout) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    layout: layout['default'],
    classNames: ["infinity-loader"],
    classNameBindings: ["infinityModel.reachedInfinity"],
    guid: null,
    scrollDebounce: 10,
    loadMoreAction: 'infinityLoad',
    loadingText: 'Loading Infinite Model...',
    loadedText: 'Infinite Model Entirely Loaded.',
    destroyOnInfinity: false,
    developmentMode: false,
    scrollable: null,

    didInsertElement: function() {
      this._setupScrollable();
      this.set('guid', Ember['default'].guidFor(this));
      this._bindScroll();
      this._checkIfInView();
    },

    willDestroyElement: function() {
      this._unbindScroll();
    },

    _bindScroll: function() {
      var _this = this;
      this.get("scrollable").on("scroll."+this.get('guid'), function() {
        Ember['default'].run.debounce(_this, _this._checkIfInView, _this.get('scrollDebounce'));
      });
    },

    _unbindScroll: function() {
      this.get("scrollable").off("scroll."+this.get('guid'));
    },

    _checkIfInView: function() {
      var selfOffset       = this.$().offset().top;
      var scrollable       = this.get("scrollable");
      var scrollableBottom = scrollable.height() + scrollable.scrollTop();

      var inView = selfOffset < scrollableBottom ? true : false;

      if (inView && !this.get('developmentMode')) {
        this.sendAction('loadMoreAction');
      }
    },

    _setupScrollable: function() {
      var scrollable = this.get('scrollable');
      if (Ember['default'].$.type(scrollable) === 'string') {
        var items = Ember['default'].$(scrollable);
        if (items.length === 1) {
          this.set('scrollable', items.eq(0));
        } else if (items.length > 1) {
          throw new Error("Multiple scrollable elements found for: " + scrollable);
        } else {
          throw new Error("No scrollable element found for: " + scrollable);
        }
      } else {
        this.set('scrollable', Ember['default'].$(window));
      }
    },

    loadedStatusDidChange: Ember['default'].observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function() {
      if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) { this.destroy(); }
    })
  });

});