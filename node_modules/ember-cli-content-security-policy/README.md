# ember-cli-content-security-policy

This addon adds the `Content-Security-Policy` header to response sent from the Ember CLI Express server.
Clearly, Ember CLI's express server is not intended for production use, and neither is this addon. This is intended as a
tool to ensure that CSP is kept in the forefront of your thoughts while developing an Ember application.

## Options

This addon is configured via your applications `config/environment.js` file. Two specific properties are
used from your projects configuration:

* `contentSecurityPolicyHeader` -- The header to use for CSP. There are two options:
  - `Content-Security-Policy-Report-Only` This is the default and means nothing is actually blocked but you get warnings in the console.
  - `Content-Security-Policy` This makes the browser block any action that conflicts with the Content Security Policy.

  The Internet Explorer variant of the header (prefixed with `X-`) is automatically added.
* `contentSecurityPolicy` -- This is an object that is used to build the final header value. Each key/value
  in this object is converted into a key/value pair in the resulting header value.

The default `contentSecurityPolicy` value is:

```javascript
  contentSecurityPolicy: {
    'default-src': "'none'",
    'script-src': "'self'",
    'font-src': "'self'",
    'connect-src': "'self'",
    'img-src': "'self'",
    'style-src': "'self'",
    'media-src': "'self'"
  }
```

Which is translated into:

```
default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self';
```

### Example

If your site uses **Google Fonts**, **Mixpanel**, a custom API at **custom-api.local** and a jQuery plugin which modifies the inline `style` attribute of some elements:

```javascript
// config/environment.js
ENV.contentSecurityPolicy = {
  'default-src': "'none'",
  'script-src': "'self' https://cdn.mxpnl.com", // Allow scripts from https://cdn.mxpnl.com
  'font-src': "'self' http://fonts.gstatic.com", // Allow fonts to be loaded from http://fonts.gstatic.com
  'connect-src': "'self' https://api.mixpanel.com http://custom-api.local", // Allow data (ajax/websocket) from api.mixpanel.com and custom-api.local
  'img-src': "'self'",
  'style-src': "'self' 'unsafe-inline' http://fonts.googleapis.com", // Allow inline styles and loaded CSS from http://fonts.googleapis.com 
  'media-src': "'self'"
}
```

More information on these options can be found at [content-security-policy.com](http://content-security-policy.com/)

*Please note*:
+ when running `ember serve` with live reload enabled, we also add the `liveReloadPort` to
the `connect-src` and `script-src` whitelists.
+ when running in development we add `'unsafe-eval'` to the `script-src`. This is to allow the `wrapInEval`
functionality that ember-cli does by default (as a sourcemaps "hack").
+ when setting the values on `contentSecurityPolicy` object to 'self', 'none', 'unsafe-inline','unsafe-eval','inline-script' or 'eval-script', you must include the single quote as shown in the default value above.

## Installation

```bash
npm install --save-dev ember-cli-content-security-policy
```

## Resources:

* http://www.w3.org/TR/CSP/
* http://content-security-policy.com/
* https://developer.mozilla.org/en-US/docs/Web/Security/CSP/Using_Content_Security_Policy
