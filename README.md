# Ember Infinity
[![Build Status](https://travis-ci.org/hhff/ember-infinity.svg)](https://travis-ci.org/hhff/ember-infinity)
[![npm version](https://badge.fury.io/js/ember-infinity.svg)](http://badge.fury.io/js/ember-infinity)
[![Ember Observer Score](http://emberobserver.com/badges/ember-infinity.svg)](http://emberobserver.com/addons/ember-infinity)

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

### infinityModel

You can also provide additional parameters to `infinityModel` that
will be passed to your backend server in addition to the
pagination params. For instance, in the following example a `category`
parameter is added:

```js
return this.infinityModel("product", { perPage: 12, startingPage: 1,
                                       category: "furniture" });
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
