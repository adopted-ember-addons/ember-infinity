import { resolve } from 'rsvp';
import { A } from '@ember/array';
import ArrayProxy from '@ember/array/proxy';
import Service from '@ember/service';
import { getOwner } from '@ember/application';

function factoryForType(type, store) {
  return getOwner(store).resolveRegistration('model:' + type);
}

function persistData(type, obj, customStore) {
  const persistentContainer = customStore.get('persistentContainer');
  const Factory = factoryForType(type, customStore);
  const record = Factory.create(obj);
  const id = obj.id;
  if (persistentContainer[type]) {
    return persistentContainer[type].set(id, record);
  }
  persistentContainer[type] = new Map();
  return persistentContainer[type].set(id, record);
}

export default Service.extend({
  /**
   * holds all models by type
   * @property persistentContainer
   */
  persistentContainer: {},
  /**
   * find objects by id
   * find method must return a promise so patching in a thennable w/ resolve
   * @method findAll
   * @param {String} type
   */
  findAll(type) {
    const containerObjs = this.get('persistentContainer')[type];
    const content = Array.from(containerObjs.values());
    const arrProxy = ArrayProxy.create({ content: A(content) });
    return resolve(arrProxy);
  },
  /**
   * @method push
   * @param {String} type
   * @param {Object} obj
   */
  push(type, obj) {
    const hydrated = persistData(type, obj, this);
    return hydrated.get(obj.id);
  },
});
