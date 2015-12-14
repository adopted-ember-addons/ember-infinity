# Ember Infinity
[![Build Status](https://travis-ci.org/hhff/ember-infinity.svg)](https://travis-ci.org/hhff/ember-infinity)
[![npm version](https://badge.fury.io/js/ember-infinity.svg)](http://badge.fury.io/js/ember-infinity)
[![Ember Observer Score](http://emberobserver.com/badges/ember-infinity.svg)](http://emberobserver.com/addons/ember-infinity)

[![Code Climate](https://codeclimate.com/github/hhff/ember-infinity/badges/gpa.svg)](https://codeclimate.com/github/hhff/ember-infinity)
[![Dependency Status](https://david-dm.org/hhff/ember-infinity.svg)](https://david-dm.org/hhff/ember-infinity)
[![devDependency Status](https://david-dm.org/hhff/ember-infinity/dev-status.svg)](https://david-dm.org/hhff/ember-infinity#info=devDependencies)

***As of v0.1.0, this library officially supports Ember 1.10 through to 2.0+ (Canary), and (aside from a few buggy versions), Ember Data pre-1.0 through to 2.0+ (Canary).  We plan to support 1.10 for the foreseeable future.***

Demo: [hhff.github.io/ember-infinity/](http://hhff.github.io/ember-infinity/)

Simple, flexible infinite scrolling for Ember CLI Apps.  Works out of the box
with the [Kaminari Gem](https://github.com/amatsuda/kaminari.git).

Inspired by @bantic's [Ember Infinite Scroll](https://github.com/bantic/ember-infinite-scroll)
repo, but without using controllers, in preparation for Ember 2.0.

## Installation

`ember install ember-infinity`

**Note:** If you're getting an error like `semver is not defined`, you probably did `npm install` instead of `ember install`.  We use [ember-version-is](https://github.com/hhff/ember-version-is) to manage the code for different versions of Ember & Ember Data, which relies on semver.  `npm install` won't run the nested generator that adds semver to your app.

## Basic Usage

```js
import Ember from 'ember';
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Route.extend(InfinityRoute, {
  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. */
    return this.infinityModel("product", { perPage: 12, startingPage: 1 });
  }
});
```

Then, you'll need to add the Infinity Loader component to your template, like so:

```hbs
{{#each model as |product|}}
  <h1>{{product.name}}</h1>
  <h2>{{product.description}}</h2>
{{/each}}

{{infinity-loader infinityModel=model}}
```

Now, whenever the `infinity-loader` is in view, it will send an action to the route
(the one where you initialized the infinityModel) to start loading the next page.

When the new records are loaded, they will automatically be pushed into the Model array.

## Advanced Usage

### JSON Request/Response Customization

By default, ember-infinity will send pagination parameters as part of a GET request as follows

```
/items?per_page=5&page=1
```

and will expect to recieve metadata in the response payload via a `total_pages` param in a `meta` object

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

If you wish to customize some aspects of the JSON contract for pagination, you may do so via your routes. For example: 

```js
import Ember from 'ember';
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Route.extend(InfinityRoute, {
  
  perPageParam: "per",              // instead of "per_page"
  pageParam: "pg",                  // instead of "page"
  totalPagesParam: "meta.total",    // instead of "meta.total_pages"

  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. */
    return this.infinityModel("product", { perPage: 12, startingPage: 1 });
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

Moreover, you can optionally pass in an object of bound parameters as a third option to `infinityModel` to further 
customize the request to the backend. The values of the contained parameters will be looked up against the route 
properties and the respective values will be included in the request:

```js
import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Ember.Route.extend(InfinityRoute, {
  ...

  prod: Ember.computed('cat', function () { return this.get('cat'); }),
  country: '',
  cat: 'shipped',

  model() {
    return this.infinityModel("product", { perPage: 12, startingPage: 1, make: "original" }, { country: "country", category: "prod" });
  }
});
```

In the example above, the query url should look like this:

```
  product?make=original&country=&category=shipped&per_page=12&page=1
```

If the value of the bound parameter cannot be found, the parameter is not included in the request. Note that you cannot have
a static and bound parameter of the same name, the latter will take precedence.

When you need to pass in bound parameters but no static parameters or custom pagination, call `infinityModel` with an empty object for it's second param:

```js
  return this.infinityModel("product", {}, { country: "country", category: "prod" });
```

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

### Event Hooks

The route mixin also provides following event hooks:

**infinityModelUpdated**

Triggered on the route whenever new objects are pushed into the infinityModel.

**Args:**

* totalPages

**infinityModelLoaded**

Triggered on the route when the infinityModel is fully loaded.

**Args:**

* lastPageLoaded

* totalPages

* infinityModel


```js
import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Ember.Route.extend(InfinityRoute, {
  ...

  model() {
    /* Load pages of the Product Model, starting from page 1, in groups of 12. */
    return this.infinityModel("product", { perPage: 12, startingPage: 1 });
  },

  infinityModelUpdated(totalPages) {
    Ember.Logger.debug('updated with more items');
  },
  infinityModelLoaded(lastPageLoaded, totalPages, infinityModel) {
    Ember.Logger.info('no more items to load');
  }
}
```

### infinity-loader

The `infinity-loader` component as some extra options to make working with it easy!

* **destroyOnInfinity**

```hbs
{{infinity-loader infinityModel=model destroyOnInfinity=true}}
```

Now, when the Infinity Model is fully loaded, the `infinity-loader` will remove itself
from the page.

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

You can optionally pass in a jQuery style selector string.  If it's not a string,
scrollable will default to using the window for the scroll binding.

### Use ember-infinity with button

You can use the route loading magic of Ember Infinity without using the InfinityLoader component.

load-more-button.js:

```js
export default Ember.Component.extend({
  loadText: 'Load more',
  loadedText: 'Loaded',
  click: function(){    
    this.sendAction();  
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
