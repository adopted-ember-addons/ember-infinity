# Ember Infinity
[![Build Status](https://travis-ci.org/ember-infinity/ember-infinity.svg)](https://travis-ci.org/ember-infinity/ember-infinity)
[![npm version](https://badge.fury.io/js/ember-infinity.svg)](http://badge.fury.io/js/ember-infinity)
[![Ember Observer Score](http://emberobserver.com/badges/ember-infinity.svg)](http://emberobserver.com/addons/ember-infinity)

[![Code Climate](https://codeclimate.com/github/ember-infinity/ember-infinity/badges/gpa.svg)](https://codeclimate.com/github/ember-infinity/ember-infinity)
[![Dependency Status](https://david-dm.org/ember-infinity/ember-infinity.svg)](https://david-dm.org/ember-infinity/ember-infinity)
[![devDependency Status](https://david-dm.org/ember-infinity/ember-infinity/dev-status.svg)](https://david-dm.org/ember-infinity/ember-infinity#info=devDependencies)

***As of v1.0-alpha and above, this library officially supports Ember 2.4 and above***

Demo: [ember-infinity.github.io/ember-infinity/](https://ember-infinity.github.io/ember-infinity/)

Simple, flexible infinite scrolling for Ember CLI Apps.  Works out of the box
with the [Kaminari Gem](https://github.com/amatsuda/kaminari.git).

Also:

![Fastbootable](https://s3.amazonaws.com/f.cl.ly/items/392o0m1N0R2515091z25/ember-infinity.gif?v=13181cd7)

## Installation

`ember install ember-infinity`

## Basic Usage

ember-infinity exposes 3 consumable items for your application.

· Route Mixin

· infinity-loader component

· infinity-loader service


Importing the `ember-infinity` Route Mixin and extend your route will give you access to `this.infinifyModel` in your model hook.

```js
import Route from '@ember/routing/route';
import InfinityRoute from "ember-infinity/mixins/route";

export default Route.extend(InfinityRoute, {
  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. */
    return this.infinityModel("product", { perPage: 12, startingPage: 1 });
  }
});
```

Then, you'll need to add the `infinity-loader` component to your template, like so, in which `model` is an instance of InfinityModel returned from your model hook.

```hbs
{{#each model as |product|}}
  <h1>{{product.name}}</h1>
  <h2>{{product.description}}</h2>
{{/each}}

{{infinity-loader infinityModel=model}}
```

Now, whenever the `infinity-loader` component is in view, it will send an action to the route or to your specific `loadMoreProduct` action
(the one where you initialized the infinityModel) to start loading the next page.

When the new records are loaded, they will automatically be pushed into the Model array.

Lastly, by default, ember-infinity expects the server response to contain something about how many total pages it can expect to fetch. `ember-infinity` defaults to looking for something like `meta: { total_pages: 20 }` in your response.  See [Advanced Usage](#AdvancedUsage).


### Closure Actions

If you want to use closure actions with `ember-infinity`, you need to be a little bit more explicit.  No more secret bubbling of an `infinityLoad` action up to your route.

See the Ember docs on passing actions to components [here](https://guides.emberjs.com/v3.0.0/components/triggering-changes-with-actions/#toc_passing-the-action-to-the-component).

```js
import Controller from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Controller.extend({
  infinityLoader: service(),

  actions: {
    /**
      Note this must be handled by you.  An action will be called with the result of your Route model hook from the infinityLoader component, similar to this:
      // closure action in infinity-loader component
      get(this, 'infinityLoad')(infinityModelContent);
    */
    loadMoreProduct(products) {
      get(this, 'infinityLoader').loadNextPage(products);
    }
  }
});
```

```js
import Route from '@ember/routing/route';
import InfinityRoute from "ember-infinity/mixins/route";

export default Route.extend(InfinityRoute, {
  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. */
    return this.infinityModel("product", { perPage: 12, startingPage: 1 });
  }
});
```

```hbs
{{#each model as |product|}}
  <h1>{{product.name}}</h1>
  <h2>{{product.description}}</h2>
{{/each}}

{{infinity-loader infinityModel=model infinityLoad=(action "loadMoreProduct")}}
```

The ability to use closure actions will be available in the `1.0.0-beta` series.  Also, this method uses Controllers.  Despite what you may have heard, controllers are a great primitive in Ember's ecosystem.  Their singleton nature is great for handling queryParams and handling actions propagated from somewhere in your component tree.


### Non-Blocking Model Hooks

In the world of optimistic route transitions & skeleton UI, it's necessary to return a POJO or similar primitive to Ember's Route#model hook to ensure the transition is not blocked by promise.

As of 1.0, the infinityModel hook now supports this behavior out of the box:

```js
model() {
  return {
    posts: this.infinityModel('post')
  };
}
```

## Advanced Usage<a name="AdvancedUsage"></a>

### JSON Request/Response Customization

By default, ember-infinity will send pagination parameters as part of a GET request as follows

```
/items?per_page=5&page=1
```

and will expect to receive metadata in the response payload via a `total_pages` param in a `meta` object

```js
{
  items: [
    {id: 1, name: 'Test'},
    {id: 2, name: 'Test 2'}
  ],
  meta: {
    total_pages: 3
  }
}
```

If you wish to customize some aspects of the JSON contract for pagination, you may do so via your routes. For example, you may want to customize the following:

Default:
- perPageParam: "per_page",
- pageParam: "page",
- totalPagesParam: "meta.total_pages",

Example Customization shown below:
- perPageParam: "per",
- pageParam: "pg",
- totalPagesParam: "meta.total",

```js
import Route from '@ember/routing/route';
import InfinityRoute from "ember-infinity/mixins/route";

export default Route.extend(InfinityRoute, {

  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. Also set query params by handing off to infinityModel */
    return this.infinityModel("product", { perPage: 12, startingPage: 1,
      perPageParam: "per", pageParam: "pg", totalPagesParam: "meta.total" });
  }
});
```

This will result in request query params being sent out as follows

```
/items?per=5&pg=1
```

and ember-infinity will be set up to parse the total number of pages from a JSON response like this:

```js
{
  items: [
    ...
  ],
  meta: {
    total: 3
  }
}
```

You can also prevent the `per_page` or `page` parameters from being sent by setting `perPageParam` or `pageParam` to `null`, respectively.

### Cursor-based pagination

If you are serving a continuously updating stream, it's helpful to keep track
of your place in the list while paginating, to avoid duplicates. This is known
as **cursor-based pagination** and is common in popular APIs like Twitter,
Facebook, and Instagram. Instead of relying on `page_number` to paginate,
you'll want to extract the `min_id` or `min_updated_at` from each page of
results, so that you can fetch the next page without risking duplicates if new
items are added to the top of the list by other users in between requests.

To do this, implement the `afterInfinityModel` hook as follows:

```js
export default Ember.Route.extend(InfinityRoute, {
  _minId: undefined,
  _minUpdatedAt: undefined,
  _canLoadMore: true,

  model() {
    return this.infinityModel("post", {}, {
      min_id: '_minId',
      min_updated_at: '_minUpdatedAt'
    });
  },

  afterInfinityModel(posts) {
    loadedAny = posts.get('length') > 0;
    this.set('_canLoadMore', loadedAny);

    this.set('_minId', posts.get('lastObject.id'));
    this.set('_minUpdatedAt', posts.get('lastObject.updated_at').toISOString());
  }
});
```

### infinityModel

You can also provide additional static parameters to `infinityModel` that
will be passed to your backend server in addition to the
pagination params. For instance, in the following example a `category`
parameter is added:

```js
return this.infinityModel("product", { perPage: 12, startingPage: 1,
                                       category: "furniture" });
```

**Extending infinityModel**

As of 1.0+, you can override or extend the behavior of Ember Infinity by providing a class that extends InfinityModel as a third argument to the Route#infinityModel hook.

**Note**: This behavior should negate any need for the pre 1.0 "Bound Params" style of work. See [Bound Parameters][Bound Parameters] Section below for more information.

```js
import InfinityRoute from 'ember-infinity/mixins/route';
import InfinityModel from 'ember-infinity/lib/infinity-model';

const ExtendedInfinityModel = InfinityModel.extend({
  buildParams() {
    let params = this._super(...arguments);
    params['category_id'] = get(this, 'global.categoryId');
    return params;
  }
});

export default Route.extend(InfinityRoute, {
  global: service(),
  categoryId: computed('global.categoryId', function() {
    return get(this, 'global.categoryId');
  }),
  model() {
    let global = get(this, 'global');
    this.infinityModel('product', {}, ExtendedInfinityModel.extend({ global }));
  }
});
```

**[DEPRECATED] Bound Parameters**

As of 1.0+, passing a third parameter to represent Bound Parameters is deprecated. All valid use cases of this feature should now be ported to the [Extended Infinity Model pattern][Extending infinityModel].

Bound Params were introduced as a way of dynamically fetching data over time - the query params passed to the server would be dictated by a property (computed or otherwise) on the route level, that was evaluated at the request time.

This design has always felt a little off - using computed properties on the Route level is an uncommon (and thus non-ergonomic) pattern in Ember. As users have requested more features in Ember Infinity, we've realized it's more important to provide a flexible primitive that can be manipulated and extended in a Ember-esque way. This opens Ember Infinity up to a great deal more use cases, while also providing a path forward to those using the pre 1.0 version of Bound Params.

* **modelPath**

`modelPath` is optional parameter for situations when you are overriding `setupController`
or when your model is on different location than `controller.model`.

```js
model() {
  return this.infinityModel("product", {
    perPage: 12,
    startingPage: 1,
    modelPath: 'controller.products'
  });
},
setupController(controller, model) {
  controller.set('products', model);
}
```

### afterInfinityModel

In some cases, a single call to your data store isn't enough. The afterInfinityModel
method is available for those cases when you need to chain together functions or
promises after fetching a model.

As a simple example, let's say you had a blog and just needed to set a property
on each Post model after fetching all of them:

```js
model() {
  return this.infinityModel("post");
},

afterInfinityModel(posts) {
  posts.setEach('author', 'Jane Smith');
}
```

As a more complex example, let's say you had a blog with Posts and Authors as separate
related models and you needed to extract an association from Posts. In that case,
return the collection you want from afterInfinityModel:

```js
model() {
  return this.infinityModel("post");
},

afterInfinityModel(posts) {
  return posts.mapBy('author').uniq();
}
```

afterInfinityModel should return either a promise, ArrayProxy, or a
falsy value.  The returned value, when not falsy, will take the place of the
resolved promise object and, if it is a promise, will hold execution until resolved.
In the case of a falsy value, the original promise result is used.

So relating this to the examples above... In the first example, afterInfinityModel
does not have an explicit return defined so the original posts promise result is used.
In the second example, the returned collection of authors is used.

### Event Hooks

The route mixin also provides following event hooks:

**infinityModelUpdated**

Triggered on the route whenever new objects are pushed into the infinityModel.

**Args:**


**infinityModelLoaded**

* lastPageLoaded

* totalPages

* infinityModel

Triggered on the route when the infinityModel is fully loaded.

**Args:**

* totalPages


```js
import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Ember.Route.extend(InfinityRoute, {
  ...

  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. */
    return this.infinityModel("product", { perPage: 12, startingPage: 1 });
  },

  infinityModelUpdated({ lastPageLoaded, totalPages, newObjects }) {
    Ember.Logger.debug('updated with more items');
  },
  infinityModelLoaded({ totalPages }) {
    Ember.Logger.info('no more items to load');
  }
}
```

### Custom store

Chances are you'll want to scroll some source other than the default ember-data store to infinity. You can do that by injecting your store into the route and specifying the store as a String in the infinityModel options:

```js
export default Ember.Route.extend(InfinityRoute, {
  customStore: Ember.inject.service('my-custom-store'),

  model(params) {
    return this.infinityModel('product', {
      perPage: 12,
      startingPage: 1,
      store: 'customStore', // custom ember-data store or ember-redux / ember-cli-simple-store / your own hand rolled store (see dummy app)
      storeFindMethod: 'findAll' // should return a promise (optional if custom store method uses `query`)
    })
  }
});
```

### infinity-loader

The `infinity-loader` component as some extra options to make working with it easy!  It is based on the IntersectionObserver API.  In essence, instead of basing your scrolling on Events (synchronous), it instead behaves asynchronously, thus not blocking the main thread.

https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

* **hideOnInfinity**

```hbs
{{infinity-loader infinityModel=model hideOnInfinity=true}}
```

Now, when the Infinity Model is fully loaded, the `infinity-loader` will hide itself.

***Versions less than 1.0.0 called this property destroyOnInfinity***

* **developmentMode**

```hbs
{{infinity-loader infinityModel=model developmentMode=true}}
```

This simply stops the `infinity-loader` from fetching triggering loads, so that
you can work on its appearance.

* **loadingText & loadedText**

```hbs
{{infinity-loader infinityModel=model loadingText="Loading..." loadedText="Loaded!"}}
```

By default, the `infinity-loader` will just output a `span` showing its status.

* **Providing a block**

```hbs
{{#infinity-loader infinityModel=model}}
  <img src="loading-spinner.gif" />
{{/infinity-loader}}
```

If you provide a block to the component, it will render the block instead of
rendering `loadingText` or `loadedText`. This will allow you to provide your
own custom markup or styling for the loading state.

* **reached-infinity Class Name**

```scss
.infinity-loader {
  background-color: wheat;
  &.reached-infinity {
    background-color: lavender;
  }
}

```

When the Infinity Model loads entirely, the `reached-infinity` class is added to the
component.

* **infinity-template Generator**

`ember generate infinity-template`

Will install the default `infinity-loader` template into your host app, at
`app/templates/components/infinity-loader`.

* **scrollable**

```hbs
{{infinity-loader scrollable="#content"}}
```

You can optionally pass in a CSS style selector string.  If not present, scrollable will default to using the window.  This is useful for scrollable areas that are constrained in the window.

* **loadPrevious**

```hbs
{{infinity-loader loadPrevious=true}}

<ul>...</ul>

{{infinity-loader}}

To load elements above your list on load, place an infinity-loader component above the list with `loadPrevious=true`.
```

* **triggerOffset**

```hbs
{{infinity-loader triggerOffset=offset}}
```

You can optionally pass an offset value.   This value will be used when calculating if the bottom of the scrollable has been reached.

* **eventDebounce**

```hbs
{{infinity-loader eventDebounce=50}}
```

Default is 50ms.  You can optionally pass a debounce time to delay loading the list when reach bottom of list

### Use ember-infinity with button

You can use the route loading magic of Ember Infinity without using the InfinityLoader component.

load-more-button.js:

```js
export default Ember.Component.extend({
  loadText: 'Load more',
  loadedText: 'Loaded',
  click: function(){
    this.sendAction('action', this.get('infinityModel'));
  }
});
```

load-more-button.hbs:

```hbs
{{#if infinityModel.reachedInfinity}}
  <button>{{loadedText}}</button>
{{else}}
  <button>{{loadText}}</button>
{{/if}}
```
template.hbs:

```hbs
<ul class="test-list">
{{#each model as |item|}}
  <li>{{item.name}}</li>
{{/each}}
</ul>

{{load-more-button action='infinityLoad' infinityModel=model}}
```

### Delay start of infinite loading until user has indicated they would like to load more

template.hbs:

```hbs
{{#if hasClickedLoadMore}}
  {{infinity-loader infinityModel=model triggerOffset=400}}
{{else}}
  <button {{action (toggle 'hasClickedLoadMore' this)}}>Load more</button>
{{/if}}
```

## Load Previous Pages

The basic idea here is to:
1. Place an infinity-loader component above and below your content.
2. Ensure loadPrevious is set to true on the infinity-loader above the content.

If your route loads on page 3, it will fetch page 2 on load.  As the user scrolls up, it will fetch page 1 and stop loading from there.  If you are already on page 1, no actions will be fired to fetch the previous page.

```hbs
<ul>
{{infinity-loader
  infinityModel=model
  loadPrevious=true
  loadedText=null
  loadingText=null}}

{{#each model as |item|}}
  <li>{{item.id}}. {{item.name}}</li>
{{/each}}

{{infinity-loader
  infinityModel=model
  loadingText="Loading more awesome records..."
  loadedText="Loaded all the records!"
  triggerOffset=500
}}
</ul>
```

## Testing

Testing can be a breeze once you have an example.  So here is an example!  Note this is using Ember's new testing APIs.

```hbs
import { find, findAll, visit, waitFor, waitUntil } from '@ember/test-helpers';

test('fetches more data when scrolled into viewport', async function(assert) {
  await visit('/infinity-scrollable');

  assert.equal(findAll('.t-items').length, 10);
  assert.equal(findAll('.infinity-scrollable.inactive').length, 1, 'component is inactive before fetching more data');
  document.querySelector('.infinity-scrollable').scrollIntoView();

  await waitFor('.infinity-scrollable.inactive');

  assert.equal(findAll('.t-items').length, 20);
  assert.equal(findAll('.infinity-scrollable.inactive').length, 1, 'component is inactive after fetching more data');
});

test('fetch more data using waitUntil', async function(assert) {
  await visit('/infinity-scrollable');

  assert.equal(findAll('.t-items').length, 10);
  assert.equal(findAll('.infinity-scrollable.inactive').length, 1, 'component is inactive before fetching more data');
  document.querySelector('.infinity-scrollable').scrollIntoView();

  await waitUntil(() => {
    return findAll('.t-items').length === 20;
  });

  assert.equal(findAll('.t-items').length, 20);
  assert.equal(findAll('.infinity-scrollable.inactive').length, 1, 'component is inactive after fetching more data');
});
```
