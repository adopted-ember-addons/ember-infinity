import { tracked } from '@glimmer/tracking';

export function DEFAULTS(Base) {
  return class extends Base {
    /**
      Increases or decreases depending on scroll direction

      @private
      @property currentPage
      @type Integer
      @default 0
    */
    @tracked currentPage = 0;

    /**
      @private
      @property extraParams
      @type Object
      @default null
    */
    @tracked extraParams = null;

    /**
      Used as a marker for the page the route starts on

      @private
      @property firstPage
      @type Integer
      @default 0
    */
    @tracked firstPage = 0;

    /**
      @public
      @property isError
      @type Boolean
      @default false
    */
    @tracked isError = false;

    /**
      @public
      @property isLoaded
      @type Boolean
      @default false
    */
    @tracked isLoaded = false;

    /**
      @public
      @property loadingMore
      @type Boolean
      @default false
    */
    @tracked loadingMore = false;

    /**
      Arbitrary meta copied over from
      the HTTP response, to maintain the
      default behavior of ember-data requests
      @type objects
      @default null
    */
    @tracked meta = null;

    /**
      @private
      @property _perPage
      @type Integer
      @default 25
    */
    @tracked perPage = 25;

    /**
      @public
      @property reachedInfinity
      @default false
     */
    @tracked reachedInfinity = false;

    /**
      @public
      @property store
      @default null
     */
    @tracked store = null;

    /**
      Name of the "per page" param in the
      resource request payload
      @type {String}
      @default  "per_page"
     */
    @tracked perPageParam = 'per_page';

    /**
      Name of the "page" param in the
      resource request payload
      @type {String}
      @default "page"
     */
    @tracked pageParam = 'page';

    /**
      Path of the "total pages" param in
      the HTTP response
      @type {String}
      @default "meta.total_pages"
     */
    @tracked totalPagesParam = 'meta.total_pages';

    /**
      Path of the "count" param in indicating
      number of records from HTTP response
      @type {String}
      @default "meta.count"
     */
    @tracked countParam = 'meta.count';

    /**
      The supported findMethod name for
      the developers Ember Data version.
      Provided here for backwards compat.
      @public
      @property storeFindMethod
      @default null
     */
    @tracked storeFindMethod = null;

    /**
      @private
      @property _count
      @type Integer
      @default 0
    */
    @tracked _count = 0;

    /**
      @private
      @property _totalPages
      @type Integer
      @default 0
    */
    @tracked _totalPages = 0;

    /**
      @private
      @property _infinityModelName
      @type String
      @default null
    */
    @tracked _infinityModelName = null;

    /**
      @private
      @property _firstPageLoaded
      @type Boolean
      @default false
    */
    @tracked _firstPageLoaded = false;

    /**
      @private
      @property _increment
      @type Integer
      @default 1
    */
    @tracked _increment = 1;

    /**
      simply used for previous page scrolling abilities and passed from
      infinity-loader component and set on infinityModel
      @private
      @property _scrollable
      @type Integer
      @default null
    */
    @tracked _scrollable = null;

    /**
      determines if can load next page or previous page (if applicable)

      @private
      @property _canLoadMore
      @type Boolean
    */
    @tracked _canLoadMore = null;
  };
}
