import Ember from 'ember';
const { Mixin, get, isEmpty } = Ember;

export default Mixin.create({
  route: null,
  _deprecatedBoundParams: null,

  /**
    get bound param off of route and include in params
   
    @method buildParams
    @return {Object}
   */
  buildParams() {
    Ember.deprecate("Ember Infinity: Bound params are now deprecated. Please pass explicitly as second param to the infinityModel method", {
      id: 'ember-infinity'
    });

    let params = this._super(...arguments);
    let boundParams = get(this, '_deprecatedBoundParams');

    if (!isEmpty(boundParams)) {
      Object.keys(boundParams).forEach(k => params[k] = get(this, `route.${boundParams[k]}`));
    }

    return params;
  }
});
