import ArrayProxy from "@ember/array/proxy"
import { computed, get } from '@ember/object';
import { objectAssign } from '../utils';
import { typeOf } from '@ember/utils';


export default ArrayProxy.extend({
  /**
    @private
    @property _perPage
    @type Integer
    @default 25
  */
  perPage: 25,

  /**
    @private
    @property currentPage
    @type Integer
    @default 0
  */
  currentPage: 0,

  /**
    @private
    @property extraParams
    @type Object
    @default {}
  */
  extraParams: {},

  /**
    @private
    @property _loadingMore
    @type Boolean
    @default false
  */
  _loadingMore: false,

  /**
    @private
    @property _totalPages
    @type Integer
    @default 0
  */
  _totalPages: 0,

  /**
    @private
    @property _infinityModelName
    @type String
    @default null
  */
  _infinityModelName: null,

  /**
    Name of the "per page" param in the
    resource request payload
    @type {String}
    @default  "per_page"
   */
  perPageParam: 'per_page',

  /**
    Name of the "page" param in the
    resource request payload
    @type {String}
    @default "page"
   */
  pageParam: 'page',

  /**
    Path of the "total pages" param in
    the HTTP response
    @type {String}
    @default "meta.total_pages"
   */
  totalPagesParam: 'meta.total_pages',

  /**
    Arbitrary meta copied over from
    the HTTP response, to maintain the
    default behavior of ember-data requests
    @type objects
    @default {}
  */
  meta: {},

  /**
    @private
    @property _firstPageLoaded
    @type Boolean
    @default false
  */
  _firstPageLoaded: false,

  /**
    @private
    @property _canLoadMore
    @type Boolean
    @default false
  */
  _canLoadMore: computed('_totalPages', 'currentPage', function() {
    const totalPages  = get(this, '_totalPages');
    const currentPage = get(this, 'currentPage');
    return (totalPages && currentPage !== undefined) ? (currentPage < totalPages) : false;
  }).readOnly(),

  /**
    build the params for the next page request
    if param does not exist (user set to null or not defined) it will not be sent with request
    @private
    @method buildParams
    @return {Object} The query params for the next page of results
   */
  buildParams() {
    const pageParams = {};
    const perPageParam = get(this, 'perPageParam');
    const pageParam = get(this, 'pageParam');
    if (typeOf(perPageParam) === 'string') {
      pageParams[perPageParam] = get(this, 'perPage');
    }
    if (typeOf(pageParam) === 'string') {
      pageParams[pageParam] = get(this, 'currentPage') + 1;
    }

    return objectAssign(pageParams, get(this, 'extraParams'));
  }
});
