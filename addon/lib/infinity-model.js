import ArrayProxy from "@ember/array/proxy"
import { computed, get, getProperties } from '@ember/object';
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
    Used as a marker for the page the route starts on

    @private
    @property firstPage
    @type Integer
    @default 0
  */
  firstPage: 0,

  /**
    Increases or decreases depending on scroll direction

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
    @property _increment
    @type Integer
    @default 1
  */
  _increment: 1,

  /**
    simply used for previous page scrolling abilities and passed from
    infinity-loader component and set on infinityModel
    @private
    @property _scrollable
    @type Integer
    @default null
  */
  _scrollable: null,

  /**
    determines if can load next page or previous page (if applicable)

    @private
    @property canLoadMore
    @type Boolean
    @default false
  */
  canLoadMore: computed('_totalPages', 'currentPage', '_increment', function() {
    let { _totalPages , currentPage, _increment } = getProperties(this, '_totalPages', 'currentPage', '_increment');
    if (_totalPages) {
      if (_increment === 1 && currentPage !== undefined) {
        // load next page
        return (currentPage < _totalPages) ? true : false;
      } else if (get(this, 'firstPage') > 1) {
        // load previous page if starting page was not 1.  Otherwise ignore this block
        return get(this, 'firstPage') > 1 ? true : false;
      }
    }
    return false;
  }),

  /**
    build the params for the next page request
    if param does not exist (user set to null or not defined) it will not be sent with request
    @private
    @method buildParams
    @return {Object} The query params for the next page of results
   */
  buildParams(increment) {
    const pageParams = {};
    let { perPageParam, pageParam } = getProperties(this, 'perPageParam', 'pageParam');
    if (typeOf(perPageParam) === 'string') {
      pageParams[perPageParam] = get(this, 'perPage');
    }
    if (typeOf(pageParam) === 'string' ) {
      pageParams[pageParam] = get(this, 'currentPage') + increment;
    }

    return objectAssign(pageParams, get(this, 'extraParams'));
  }
});
