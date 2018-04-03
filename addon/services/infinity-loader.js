import Service from '@ember/service';
import { A } from '@ember/array';

export default Service.extend({
  infinityModels: null,

  /**
    @method pushObjects
    @param
    @param {Array} queryObject - list of Store models
   */
  pushObjects(infinityModel, queryObject) {
    return infinityModel.pushObjects(queryObject.toArray());
  },

  /**
    @method unshiftObjects
    @param
    @param {Array} queryObject - list of Store models
   */
  unshiftObjects(infinityModel, queryObject) {
    return infinityModel.unshiftObjects(queryObject.toArray());
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
    let len = infinityModel.get('length');
    return infinityModel.replace(0, len, newInfinityModel.toArray());
  },
});
