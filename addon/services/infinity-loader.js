import Service from '@ember/service';
import InfinityModel from 'ember-infinity/lib/infinity-model';
import EmberError from '@ember/error';

let checkInstanceOf = (infinityModel) => {
  if (!(infinityModel instanceof InfinityModel)) {
    throw new EmberError("Ember Infinity: You must pass an Infinity Model instance as the first argument");
  }
  return true;
};

let convertToArray = (queryObject) => {
  if (queryObject.toArray) {
    return queryObject.toArray();
  }
  return queryObject;
};

export default Service.extend({
  infinityModels: null,

  /**
    @method pushObjects
    @param {ArrayProxy} infinityModel
    @param {Array} queryObject - list of Store models
   */
  pushObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.pushObjects(convertToArray(queryObject));
    }
  },

  /**
    @method unshiftObjects
    @param {ArrayProxy} infinityModel
    @param {Array} queryObject - list of Store models
   */
  unshiftObjects(infinityModel, queryObject) {
    if (checkInstanceOf(infinityModel)) {
      return infinityModel.unshiftObjects(convertToArray(queryObject));
    }
  },

  /**
    - Useful for updating the infinity model with a new array
    - For example, you fetch a new array from your backend based on search criteria and need to swap out what currently
    exists with what was returned from your query
    - HOWEVER, note this method can be particularly dangerous, for example, when using to filter a list.  If you are not using queryParams or
    some other sort of state that is passed to your model hook, when your component goes to fetch the next page of documents, it will not include
    the filter param.  This will lead to a list that partly does not represent what the user filtered.

    @method replace
    @param {ArrayProxy} infinityModel
    @param newCollection - Ember Data (or similar store) response
   */
  replace(infinityModel, newCollection) {
    if (checkInstanceOf(infinityModel)) {
      let len = infinityModel.get('length');
      infinityModel.replace(0, len, convertToArray(newCollection));
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
