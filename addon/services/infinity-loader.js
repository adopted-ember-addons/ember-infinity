import Service from '@ember/service';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import EmberError from '@ember/error';

let checkInstanceOf = (infinityModel) => {
  if (!(infinityModel instanceof InfinityModel)) {
    throw new EmberError("Ember Infinity: You must pass an Infinity Model instance as the first argument");
  }
  return true;
}

export default Service.extend({
  infinityModels: null,

  /**
    @method pushObjects
    @param {ArrayProxy} infinityModel
    @param {Array} queryObject - list of Store models
   */
  pushObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.pushObjects(queryObject.toArray());
    }
  },

  /**
    @method unshiftObjects
    @param {ArrayProxy} infinityModel
    @param {Array} queryObject - list of Store models
   */
  unshiftObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.unshiftObjects(queryObject.toArray());
    }
  },

  /**
    Useful for updating the infinity model with a new array
    For example, you fetch a new array from your backend based on search criteria and need to swap out what currently
    exists with what was returned from your query

    @method replace
    @param {ArrayProxy} infinityModel
    @param newInfinityModel - Ember Data (or similar store) response
   */
  replace(infinityModel, newInfinityModel) {
    if (checkInstanceOf(infinityModel)) {
      let len = infinityModel.get('length');
      infinityModel.replace(0, len, newInfinityModel.toArray());
      return infinityModel;
    }
  },

  /**
    Useful for clearing out the collection

    @method flush
    @param {ArrayProxy} infinityModel
   */
  flush(infinityModel) {
    if (checkInstanceOf(infinityModel)) {
      let len = infinityModel.get('length');
      infinityModel.replace(0, len, []);
      return infinityModel;
    }
  },
});
