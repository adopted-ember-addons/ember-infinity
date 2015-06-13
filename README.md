# Ember Infinity
[![Build Status](https://travis-ci.org/hhff/ember-infinity.svg)](https://travis-ci.org/hhff/ember-infinity)
[![npm version](https://badge.fury.io/js/ember-infinity.svg)](http://badge.fury.io/js/ember-infinity)
[![Ember Observer Score](http://emberobserver.com/badges/ember-infinity.svg)](http://emberobserver.com/addons/ember-infinity)

Demo: [hhff.github.io/ember-infinity/](http://hhff.github.io/ember-infinity/)

Simple, flexible infinite scrolling for Ember CLI Apps.  Works out of the box
with the [Kaminari Gem](https://github.com/amatsuda/kaminari.git).

Inspired by @bantic's [Ember Infinite Scroll](https://github.com/bantic/ember-infinite-scroll)
repo, but without using controllers, in preparation for Ember 2.0.

## Installation

`ember install ember-infinity`

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

```html
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

````
/items?per_page=5&page=1
```` 

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

````
/items?per=5&pg=1
```` 

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

### infinityModel

You can also provide additional parameters to `infinityModel` that
will be passed to your backend server in addition to the
pagination params. For instance, in the following example a `category`
parameter is added:

```js
return this.infinityModel("product", { perPage: 12, startingPage: 1,
                                       category: "furniture" });
```

If the extra param you pass in is available as a property/computed on the route and it returns some value, its value will be used to set the value of this extra param, otherwise, it'll be left as is:

```js
prod: function () {
  return this.get('cat');
}.property('cat'),

country: '',
cat: 'shipped',
date: null,

return this.infinityModel("product", { perPage: 12, startingPage: 1, make: "original", country: "country", category: "prod", date: "2015" });
```

The route object will be inspected to see if the extra param's value is a property that returns anything but 'none' (as in: not `Ember.isNone(something)`).

In the example above, the query url should look like this:

```js
    product?make=original&country=&category=shipped&date=2015&per_page=12&page1
```

* **modelPath**

`modelPath` is optional parameter for situations when you are overriding `setupController`
or when your model is on different location than `controller.model`.
```js
model: function() {
  return this.infinityModel("product", {
    perPage: 12,
    startingPage: 1,
    modelPath: 'controller.products'
  });
},
setupController: function(controller, model) {
  controller.set('products', model);
}
```
### event hooks

ember-infinity provides a route mixin that enables us to hook into the following events:

* **infinityModelUpdated**

This gets fired up when data is loaded into the model.

* **infinityModelLoaded**

Fired up when there's no more data to load from the backend, needless to say this depends on your `meta.total_pages` key returned by your server.

```javascript
import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Ember.Route.extend(InfinityRoute, {
  ...

	infinityModelUpdated: function() {
		Ember.Logger.debug('updated with more items');
	},
	infinityModelLoaded: function() {
		Ember.Logger.info('no more items to load');
	}
}
```

### infinity-loader

The `infinity-loader` component as some extra options to make working with it easy!

* **destroyOnInfinity**

```html
{{infinity-loader infinityModel=model destroyOnInfinity=true}}
```

Now, when the Infinity Model is fully loaded, the `infinity-loader` will remove itself
from the page.

* **developmentMode**

```html
{{infinity-loader infinityModel=model developmentMode=true}}
```

This simply stops the `infinity-loader` from fetching triggering loads, so that
you can work on its appearance.

* **loadingText & loadedText**

```html
{{infinity-loader infinityModel=model loadingText="Loading..." loadedText="Loaded!"}}
```

By default, the `infinity-loader` will just output a `span` showing its status.

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

```html
{{infinity-loader scrollable="#content"}}
```

You can optionally pass in a jQuery style selector string.  If it's not a string,
scrollable will default to using the window for the scroll binding.
