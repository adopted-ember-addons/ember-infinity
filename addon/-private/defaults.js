export const DEFAULTS = {
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
    @default null
  */
  extraParams: null,

  /**
    Used as a marker for the page the route starts on

    @private
    @property firstPage
    @type Integer
    @default 0
  */
  firstPage: 0,

  /**
    @public
    @property isError
    @type Boolean
    @default false
  */
  isError: false,

  /**
    @public
    @property isLoaded
    @type Boolean
    @default false
  */
  isLoaded: false,

  /**
    @public
    @property loadingMore
    @type Boolean
    @default false
  */
  loadingMore: false,

  /**
    Arbitrary meta copied over from
    the HTTP response, to maintain the
    default behavior of ember-data requests
    @type objects
    @default null
  */
  meta: null,

  /**
    @private
    @property _perPage
    @type Integer
    @default 25
  */
  perPage: 25,

  /**
    @public
    @property reachedInfinity
    @default false
   */
  reachedInfinity: false,

  /**
    @public
    @property store
    @default null
   */
  store: null,

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
    Path of the "count" param in indicating
    number of records from HTTP response
    @type {String}
    @default "meta.count"
   */
  countParam: 'meta.count',

  /**
    The supported findMethod name for
    the developers Ember Data version.
    Provided here for backwards compat.
    @public
    @property storeFindMethod
    @default null
   */
  storeFindMethod: null,

  /**
    @private
    @property _count
    @type Integer
    @default 0
  */
  _count: 0,

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
    @property _canLoadMore
    @type Boolean
  */
  _canLoadMore: null
}
