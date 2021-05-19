# Changelog

## [2.2.1](https://github.com/ember-infinity/ember-infinity/tree/v2.2.1) (2021-05-19)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v2.1.0...v2.2.1)

- Bugfix Use abs position when checking if element is visible in viewport (https://github.com/ember-infinity/ember-infinity/pull/437)
- BFix hasBlock deprecation (RFC #689) (https://github.com/ember-infinity/ember-infinity/pull/443)

## [2.1.0](https://github.com/ember-infinity/ember-infinity/tree/v2.1.0) (2020-01-24)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v2.0.3...v2.1.0)

- Remove tagName from loader component to remove isVisible (https://github.com/ember-infinity/ember-infinity/pull/416)
- Replace Mixin with inViewport service (https://github.com/ember-infinity/ember-infinity/pull/410)

## [2.0.3](https://github.com/ember-infinity/ember-infinity/tree/v2.0.3) (2020-01-18)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v2.0.1...v2.0.3)

- Show loader when reachedInfinity changes (https://github.com/ember-infinity/ember-infinity/pull/413)
- Bump node in pkg.json (https://github.com/ember-infinity/ember-infinity/pull/408)

## [2.0.1](https://github.com/ember-infinity/ember-infinity/tree/v2.0.1) (2019-12-31)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v2.0.0...v2.0.1)

- In Viewport bump (https://github.com/ember-infinity/ember-infinity/pull/407)

## [2.0.0](https://github.com/ember-infinity/ember-infinity/tree/v2.0.0) (2019-12-31)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v1.4.9...v2.0.0)

- [MAJOR]: Node 10 bump (https://github.com/ember-infinity/ember-infinity/pull/401)

## [1.4.9](https://github.com/ember-infinity/ember-infinity/tree/v1.4.9) (2019-09-20)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v1.1.3...v1.4.2)

- Replace Ember.Evented for own implementation (https://github.com/ember-infinity/ember-infinity/pull/390)

## [1.4.8](https://github.com/ember-infinity/ember-infinity/tree/v1.4.8) (2019-09-09)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v1.4.7...v1.4.8)

- Optional store injection (https://github.com/ember-infinity/ember-infinity/pull/388)

## [1.4.7](https://github.com/ember-infinity/ember-infinity/tree/v1.4.7) (2019-05-24)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v1.4.2...v1.4.7)

## [1.4.2](https://github.com/ember-infinity/ember-infinity/tree/v1.4.2) (2019-04-15)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v1.1.3...v1.4.2)

- General minor updates (https://github.com/ember-infinity/ember-infinity/pull/330)
- Use scollingElement for cross browser support for scrolling area (https://github.com/ember-infinity/ember-infinity/pull/334)
- Use intersection-observer-admin for managing Intersection Observers (https://github.com/ember-infinity/ember-infinity/pull/341)
- Fix infinity model container so services can be injected on it (https://github.com/ember-infinity/ember-infinity/pull/338)
- Allow nested object to cache (https://github.com/ember-infinity/ember-infinity/pull/356)
- Minor improvements to docs and make `isLoaded` && `isError` public (https://github.com/ember-infinity/ember-infinity/pull/364)
- loadingMore public (https://github.com/ember-infinity/ember-infinity/pull/372)

## [1.1.3](https://github.com/ember-infinity/ember-infinity/tree/v1.1.3) (2018-08-20)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v1.0.0...v1.1.3)

**Important Merged pull requests:**

- Fix non blocking model - thanks @Duder-onomy [#315](https://github.com/ember-infinity/ember-infinity/pull/315)
- Fix first load hideOnInfinity [#312](https://github.com/ember-infinity/ember-infinity/pull/312)
- Update deps [#308](https://github.com/ember-infinity/ember-infinity/pull/308)
- Ensure nested components work [#303](https://github.com/ember-infinity/ember-infinity/pull/303)
- Fix afterInfinityModel hook [#299](https://github.com/ember-infinity/ember-infinity/pull/299)

**Closed issues:**
- Regression, non-blocking model support and initial page of results not hiding infinityLoader [#313](https://github.com/ember-infinity/ember-infinity/issues/313)
- Infinity-loader not hiding when there's just a single page [#311](https://github.com/ember-infinity/ember-infinity/issues/311)
- It does not display the second page [#310](https://github.com/ember-infinity/ember-infinity/issues/310)
- Not working properly in components [#302](https://github.com/ember-infinity/ember-infinity/issues/302)
- Accessing `this` from within the `infinityModelLoaded()` method [#300](https://github.com/ember-infinity/ember-infinity/issues/300)
- afterInfinityModel not working with infinity service [#298](https://github.com/ember-infinity/ember-infinity/issues/298)
- Subclassing InfinityModel provides no pattern to replace route._afterInfinityModel [#292](https://github.com/ember-infinity/ember-infinity/issues/292)

## [1.0.0](https://github.com/ember-infinity/ember-infinity/tree/v1.0.0) (2018-06-17)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.8...1.0.0)

**Important Merged pull requests:**

- Component Service Interaction [#287](https://github.com/ember-infinity/ember-infinity/pull/287)
- Load more until screen is filled [#275](https://github.com/ember-infinity/ember-infinity/pull/279)
- Enable closure actions [#271](https://github.com/ember-infinity/ember-infinity/pull/271)
- Load previous pages [#259](https://github.com/ember-infinity/ember-infinity/pull/259)

**Closed issues:**

## [1.0.0-alpha.*](https://github.com/ember-infinity/ember-infinity/tree/1.0.0-alpha.9) (2018-03-07)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.8...1.0.0-alpha.9)

**Closed issues:**

- Cursor based, API without count key [#285](https://github.com/ember-infinity/ember-infinity/issues/285)
- Doesn't keep fetching more on page load if view port is smaller than the window [#278](https://github.com/ember-infinity/ember-infinity/issues/278)
- Hook to update InfinityModel [#272](https://github.com/ember-infinity/ember-infinity/issues/272)
- Add items to model is not working [#270](https://github.com/ember-infinity/ember-infinity/issues/270)
- Unable to extend InfinityModel following README.md [#263](https://github.com/ember-infinity/ember-infinity/issues/263)
- missing ember-in-viewport [#256](https://github.com/ember-infinity/ember-infinity/issues/256)

**Merged pull requests:**

- fix after model hook [#288](https://github.com/ember-infinity/ember-infinity/commit/10b2c377c63dad02eced516e0b9ff5e46b7e49e1)
- improve cursor based docs + fix a bug in setting canLoadMore [#286](https://github.com/ember-infinity/ember-infinity/commit/b12d9746f4168c98f42212fe84163a233c5ca327)
- Rename infinity loader service to `infinity` [#283](https://github.com/ember-infinity/ember-infinity/commit/7ddb8cf6fdab2625c70ada6a8e99db2d37df8a5c)
- InfinityModels managed by service + closure actions [#271](https://github.com/ember-infinity/ember-infinity/commit/90b905f7814a47b72b0deedfd1bf72eeb3887bf8)
- Load Previous pages [#259](https://github.com/ember-infinity/ember-infinity/commit/bf60f6856b5d928eac4b349b2c97bc1fb9eb4736)
- InfinityModel used to store query params [#231](https://github.com/ember-infinity/ember-infinity/commit/f48626454a736a3474586d6739c1ac0674af46b2)
- Non Blocking Model hooks support [#232](https://github.com/ember-infinity/ember-infinity/commit/408ea7f7dcabde15b38b0f9b5b98f85c143e05fc)
- Ability to extend the InfinityModel [#236](https://github.com/ember-infinity/ember-infinity/commit/7f6671c6feedac13bc34011f78f08a08161fe0bb)
- Replace scroll logic with ember-in-viewport [#242](https://github.com/ember-infinity/ember-infinity/commit/b0b653490be928e586d9b5e0a2024b0dfd4b7571) [258](https://github.com/ember-infinity/ember-infinity/commit/163efac3667bb0de2e61371b97134fcd6bb46d68)
- Ember and Ember-Data and Ember-CLI 3.0 [#260](https://github.com/ember-infinity/ember-infinity/commit/ed0de5002ef8a529abe25f432495714415254069)

## [0.2.8](https://github.com/hhff/ember-infinity/tree/0.2.8) (2017-01-03)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.7...0.2.8)

**Closed issues:**

- Won't load data, but fires all functions [\#199](https://github.com/hhff/ember-infinity/issues/199)
- Release 0.2.7 needs published to NPM [\#198](https://github.com/hhff/ember-infinity/issues/198)
- Option to use meta data from headers [\#197](https://github.com/hhff/ember-infinity/issues/197)
- How to create a new record? [\#196](https://github.com/hhff/ember-infinity/issues/196)

**Merged pull requests:**

- Skip pagination parameters when set to null  [\#147](https://github.com/hhff/ember-infinity/pull/147) ([ShogunPanda](https://github.com/ShogunPanda))

## [0.2.7](https://github.com/hhff/ember-infinity/tree/0.2.7) (2016-11-28)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.6...0.2.7)

**Closed issues:**

- Not working with multiple models. [\#193](https://github.com/hhff/ember-infinity/issues/193)
- Doesn't work with RSVP? [\#192](https://github.com/hhff/ember-infinity/issues/192)
- Doesn't load data [\#190](https://github.com/hhff/ember-infinity/issues/190)
- "Calling set on destroyed object" [\#189](https://github.com/hhff/ember-infinity/issues/189)
- Inside a component? [\#180](https://github.com/hhff/ember-infinity/issues/180)
- Only semi-working out of the box - says Infinity Model Fully Loaded [\#179](https://github.com/hhff/ember-infinity/issues/179)

**Merged pull requests:**

- Ensures no FastBoot environment before loading more records [\#194](https://github.com/hhff/ember-infinity/pull/194) ([willviles](https://github.com/willviles))
- Fix Ember Infinity Tests [\#187](https://github.com/hhff/ember-infinity/pull/187) ([hhff](https://github.com/hhff))

## [0.2.6](https://github.com/hhff/ember-infinity/tree/0.2.6) (2016-08-08)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.5...0.2.6)

**Closed issues:**

- Basic Usage [\#168](https://github.com/hhff/ember-infinity/issues/168)
- Ember Infinity on 2 or more nested routes [\#150](https://github.com/hhff/ember-infinity/issues/150)
- loadMoreAction fires prematurely [\#82](https://github.com/hhff/ember-infinity/issues/82)

**Merged pull requests:**

- Only infinityLoad for this route's infinityModel [\#174](https://github.com/hhff/ember-infinity/pull/174) ([jimmay5469](https://github.com/jimmay5469))

## [0.2.5](https://github.com/hhff/ember-infinity/tree/0.2.5) (2016-08-05)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.4...0.2.5)

**Closed issues:**

- Dynamic change scrollable element [\#172](https://github.com/hhff/ember-infinity/issues/172)
- Loader with custom scrollable never fires [\#126](https://github.com/hhff/ember-infinity/issues/126)

**Merged pull requests:**

- Fix loader with custom scrollable that never fires [\#173](https://github.com/hhff/ember-infinity/pull/173) ([jimmay5469](https://github.com/jimmay5469))

## [0.2.4](https://github.com/hhff/ember-infinity/tree/0.2.4) (2016-07-12)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.3...0.2.4)

**Closed issues:**

- Can it work without totalPages? [\#166](https://github.com/hhff/ember-infinity/issues/166)
- ember-infinity demo as Ember Twiddle for presenting issues [\#165](https://github.com/hhff/ember-infinity/issues/165)
- Introduction to ember-infinity on The Ember Show at Global Ember Meetup [\#162](https://github.com/hhff/ember-infinity/issues/162)
- Component not updating when infinityModel.reachedInfinity [\#160](https://github.com/hhff/ember-infinity/issues/160)
- How to load a hasMany relationship? [\#159](https://github.com/hhff/ember-infinity/issues/159)
- Using offset parameter in backend request [\#157](https://github.com/hhff/ember-infinity/issues/157)
- Infinity model and server side filtering [\#156](https://github.com/hhff/ember-infinity/issues/156)
- strange behavior [\#155](https://github.com/hhff/ember-infinity/issues/155)
- Adding without scroll action, Deleting records [\#154](https://github.com/hhff/ember-infinity/issues/154)
- Using websockets to insert new records [\#149](https://github.com/hhff/ember-infinity/issues/149)
- Pagination when the endpoint is not standard. [\#148](https://github.com/hhff/ember-infinity/issues/148)
- Preserve scrolling position and model data when navigating from/to InfinityRoute [\#146](https://github.com/hhff/ember-infinity/issues/146)
- Using skip / take instead of page / perPage [\#139](https://github.com/hhff/ember-infinity/issues/139)
- Upgrade to be Fastboot-able [\#134](https://github.com/hhff/ember-infinity/issues/134)

**Merged pull requests:**

- Use new super format from init to avoid deprecation warnings [\#169](https://github.com/hhff/ember-infinity/pull/169) ([mdentremont](https://github.com/mdentremont))
- Fix typo in README [\#158](https://github.com/hhff/ember-infinity/pull/158) ([mdentremont](https://github.com/mdentremont))

## [0.2.3](https://github.com/hhff/ember-infinity/tree/0.2.3) (2016-04-12)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/0.2.2...0.2.3)

**Closed issues:**

- will this work with ember 2.4? [\#152](https://github.com/hhff/ember-infinity/issues/152)
- How to load two different infinity model on same page? [\#93](https://github.com/hhff/ember-infinity/issues/93)

**Merged pull requests:**

- Use Ember.assign over Ember.merge when possible [\#153](https://github.com/hhff/ember-infinity/pull/153) ([martndemus](https://github.com/martndemus))

## [0.2.2](https://github.com/hhff/ember-infinity/tree/0.2.2) (2016-03-11)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.2.1...0.2.2)

**Closed issues:**

- TypeError: infinityModel.pushObjects is not a function [\#144](https://github.com/hhff/ember-infinity/issues/144)
- Issue with cursor based pagination [\#140](https://github.com/hhff/ember-infinity/issues/140)
- this.$\(\).offset\(\).top undefined at times [\#137](https://github.com/hhff/ember-infinity/issues/137)
- How to use route mixin within component [\#136](https://github.com/hhff/ember-infinity/issues/136)
- call view on infinityModelUpdate event [\#135](https://github.com/hhff/ember-infinity/issues/135)
- Preferred method of handling server error [\#133](https://github.com/hhff/ember-infinity/issues/133)
- Can we load it in reverse? [\#132](https://github.com/hhff/ember-infinity/issues/132)
- Anyone have computed.sort success [\#131](https://github.com/hhff/ember-infinity/issues/131)
- Issue using afterInfinityModel [\#123](https://github.com/hhff/ember-infinity/issues/123)
- Ember 1.13.10 get\('content'\) vs toArrray\(\) [\#111](https://github.com/hhff/ember-infinity/issues/111)
- Uncaught TypeError: Cannot read property 'offset' of undefined [\#100](https://github.com/hhff/ember-infinity/issues/100)
- Add code coverage % changed to pull requests [\#65](https://github.com/hhff/ember-infinity/issues/65)

**Merged pull requests:**

- Prevent load more action when component is destroying or destroyed [\#145](https://github.com/hhff/ember-infinity/pull/145) ([ilucin](https://github.com/ilucin))
- Fixed failing test `Don't make functions within a loop.` [\#143](https://github.com/hhff/ember-infinity/pull/143) ([mariuszzak](https://github.com/mariuszzak))
- Update README.md with requirements for the return value from afterInfinityModel [\#130](https://github.com/hhff/ember-infinity/pull/130) ([chbonser](https://github.com/chbonser))
- ember-cli 1.13.8 -\> 1.13.14 [\#129](https://github.com/hhff/ember-infinity/pull/129) ([john-kurkowski](https://github.com/john-kurkowski))
- Pin jQuery to Ember.js compatible version [\#128](https://github.com/hhff/ember-infinity/pull/128) ([john-kurkowski](https://github.com/john-kurkowski))
- Update README.md [\#127](https://github.com/hhff/ember-infinity/pull/127) ([albertovasquez](https://github.com/albertovasquez))

## [v0.2.1](https://github.com/hhff/ember-infinity/tree/v0.2.1) (2015-12-28)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.2.0...v0.2.1)

**Closed issues:**

- load data from nested url [\#124](https://github.com/hhff/ember-infinity/issues/124)
- Infinity model allow skip-like pagination [\#122](https://github.com/hhff/ember-infinity/issues/122)
- Where does `loadMoreAction` action get's handled? [\#118](https://github.com/hhff/ember-infinity/issues/118)
- Uncaught Error: \<...\> had no action handler for: infinityLoad [\#117](https://github.com/hhff/ember-infinity/issues/117)
- ember-cli-htmlbars is out of date [\#114](https://github.com/hhff/ember-infinity/issues/114)
- Not Working With JSON API [\#109](https://github.com/hhff/ember-infinity/issues/109)
- "Could not fetch Infinity Model" masks other errors [\#96](https://github.com/hhff/ember-infinity/issues/96)
- Add README Instructions about building an Infinity Button Component [\#49](https://github.com/hhff/ember-infinity/issues/49)

**Merged pull requests:**

- Don't swallow errors when loading records [\#125](https://github.com/hhff/ember-infinity/pull/125) ([philipp-spiess](https://github.com/philipp-spiess))
- Update README [\#121](https://github.com/hhff/ember-infinity/pull/121) ([ryanponce](https://github.com/ryanponce))
- Update ember-qunit to fix build [\#119](https://github.com/hhff/ember-infinity/pull/119) ([anilmaurya](https://github.com/anilmaurya))
- update htmlbars dependency [\#115](https://github.com/hhff/ember-infinity/pull/115) ([davidgoli](https://github.com/davidgoli))
- Update README, add Infinity Button Component [\#113](https://github.com/hhff/ember-infinity/pull/113) ([anilmaurya](https://github.com/anilmaurya))
- Update README [\#112](https://github.com/hhff/ember-infinity/pull/112) ([ryanponce](https://github.com/ryanponce))
- Changed references to this.store in order to allow using the mixin inside components [\#108](https://github.com/hhff/ember-infinity/pull/108) ([mariuszzak](https://github.com/mariuszzak))
- Improve tests [\#106](https://github.com/hhff/ember-infinity/pull/106) ([davidgoli](https://github.com/davidgoli))
- Implemented triggerOffset property. [\#87](https://github.com/hhff/ember-infinity/pull/87) ([mariuszzak](https://github.com/mariuszzak))

## [v0.2.0](https://github.com/hhff/ember-infinity/tree/v0.2.0) (2015-11-25)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.2.0-beta.1...v0.2.0)

**Closed issues:**

- Tests fail under Ember 2.3.0-beta1 [\#103](https://github.com/hhff/ember-infinity/issues/103)
- Deprecation Ember 2+ [\#101](https://github.com/hhff/ember-infinity/issues/101)
- \_canLoadMore doesn't fetch totalPages [\#99](https://github.com/hhff/ember-infinity/issues/99)
- Update queryParams with page and perPage [\#95](https://github.com/hhff/ember-infinity/issues/95)
- Cursor-based pagination loads duplicate results [\#90](https://github.com/hhff/ember-infinity/issues/90)
- Refactor Tests for Code Climate [\#80](https://github.com/hhff/ember-infinity/issues/80)

**Merged pull requests:**

- Add afterInfinityModel [\#105](https://github.com/hhff/ember-infinity/pull/105) ([davidgoli](https://github.com/davidgoli))
- Upgrade ember-qunit [\#104](https://github.com/hhff/ember-infinity/pull/104) ([davidgoli](https://github.com/davidgoli))
- Refactor Route test [\#98](https://github.com/hhff/ember-infinity/pull/98) ([davidgoli](https://github.com/davidgoli))

## [v0.2.0-beta.1](https://github.com/hhff/ember-infinity/tree/v0.2.0-beta.1) (2015-10-20)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.1.2...v0.2.0-beta.1)

**Closed issues:**

- Resetting the starting page? [\#91](https://github.com/hhff/ember-infinity/issues/91)
- semver is not defined error when upgraded to ember 2.0 [\#85](https://github.com/hhff/ember-infinity/issues/85)
- Infinity conflicts with liquid-fire [\#52](https://github.com/hhff/ember-infinity/issues/52)

**Merged pull requests:**

- Allow setting starting page as 0. [\#94](https://github.com/hhff/ember-infinity/pull/94) ([wuron](https://github.com/wuron))
- Reduce duplication in route [\#88](https://github.com/hhff/ember-infinity/pull/88) ([davidgoli](https://github.com/davidgoli))
- Allow Canary Failures [\#86](https://github.com/hhff/ember-infinity/pull/86) ([hhff](https://github.com/hhff))

## [v0.1.2](https://github.com/hhff/ember-infinity/tree/v0.1.2) (2015-09-02)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.1.1...v0.1.2)

**Closed issues:**

- Scroll to current active element in list view [\#84](https://github.com/hhff/ember-infinity/issues/84)

**Merged pull requests:**

- yield from the template [\#72](https://github.com/hhff/ember-infinity/pull/72) ([davidgoli](https://github.com/davidgoli))

## [v0.1.1](https://github.com/hhff/ember-infinity/tree/v0.1.1) (2015-08-29)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.1.0...v0.1.1)

**Closed issues:**

- E/ED 2.0.0 support [\#81](https://github.com/hhff/ember-infinity/issues/81)
- Better Documentation for the UpdateInfinityModel hook [\#74](https://github.com/hhff/ember-infinity/issues/74)
- Update current model is not working [\#53](https://github.com/hhff/ember-infinity/issues/53)
- Delete all items and perform a new query [\#47](https://github.com/hhff/ember-infinity/issues/47)
- Remove some items from array [\#42](https://github.com/hhff/ember-infinity/issues/42)

**Merged pull requests:**

- Document updateInfinityModel hook, closes \#74 [\#83](https://github.com/hhff/ember-infinity/pull/83) ([hhff](https://github.com/hhff))
- \[Bugfix\] Preserving scrollable on subsequent rerenders - reported by @cprussin [\#69](https://github.com/hhff/ember-infinity/pull/69) ([ManuelArno](https://github.com/ManuelArno))

## [v0.1.0](https://github.com/hhff/ember-infinity/tree/v0.1.0) (2015-08-27)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.14...v0.1.0)

**Closed issues:**

- this.refresh\(\)  unbinds Eventhandler [\#78](https://github.com/hhff/ember-infinity/issues/78)

**Merged pull requests:**

- bare minimum update work for ember 2 [\#79](https://github.com/hhff/ember-infinity/pull/79) ([ManuelArno](https://github.com/ManuelArno))

## [v0.0.14](https://github.com/hhff/ember-infinity/tree/v0.0.14) (2015-08-20)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.13...v0.0.14)

**Closed issues:**

- load multiple models in an infinity route [\#67](https://github.com/hhff/ember-infinity/issues/67)
- Overwrite infinity-loader template no longer works [\#51](https://github.com/hhff/ember-infinity/issues/51)

**Merged pull requests:**

- Allow Template Overrides, closes \#51 [\#68](https://github.com/hhff/ember-infinity/pull/68) ([hhff](https://github.com/hhff))
- dont rely on didInsertElement setting up scrollable [\#63](https://github.com/hhff/ember-infinity/pull/63) ([ManuelArno](https://github.com/ManuelArno))
- Update for Ember Data 1.13.x, closes \#32 [\#48](https://github.com/hhff/ember-infinity/pull/48) ([hhff](https://github.com/hhff))

## [v0.0.13](https://github.com/hhff/ember-infinity/tree/v0.0.13) (2015-08-01)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.12...v0.0.13)

**Closed issues:**

- Reverse order functionality \(asc / desc\) [\#66](https://github.com/hhff/ember-infinity/issues/66)
- Should we do versioning lockstep? [\#64](https://github.com/hhff/ember-infinity/issues/64)
- Skip x entries instead of requesting pages [\#50](https://github.com/hhff/ember-infinity/issues/50)

**Merged pull requests:**

- Use Ember.get\(\) to access store [\#62](https://github.com/hhff/ember-infinity/pull/62) ([mike-north](https://github.com/mike-north))
- Update ember-cli to 1.13.1 [\#60](https://github.com/hhff/ember-infinity/pull/60) ([mike-north](https://github.com/mike-north))
- made \_currentPage public =\> is now currentPage [\#59](https://github.com/hhff/ember-infinity/pull/59) ([dj-hedgehog](https://github.com/dj-hedgehog))

## [v0.0.12](https://github.com/hhff/ember-infinity/tree/v0.0.12) (2015-07-18)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.11...v0.0.12)

**Merged pull requests:**

- Added the ability to pass in extra params that are \(computed\) properties [\#43](https://github.com/hhff/ember-infinity/pull/43) ([ashrafhasson](https://github.com/ashrafhasson))

## [v0.0.11](https://github.com/hhff/ember-infinity/tree/v0.0.11) (2015-07-17)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.10...v0.0.11)

**Closed issues:**

- support multiple directions [\#55](https://github.com/hhff/ember-infinity/issues/55)
- Load more button instead of infinite scrolling [\#46](https://github.com/hhff/ember-infinity/issues/46)
- Update for Ember 2.0 [\#32](https://github.com/hhff/ember-infinity/issues/32)

**Merged pull requests:**

- extract `model.pushObjects` to a method [\#54](https://github.com/hhff/ember-infinity/pull/54) ([asross](https://github.com/asross))

## [v0.0.10](https://github.com/hhff/ember-infinity/tree/v0.0.10) (2015-06-22)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.9...v0.0.10)

**Closed issues:**

- customizations not persisting [\#34](https://github.com/hhff/ember-infinity/issues/34)
- Babel ES6 Polyfill required? [\#33](https://github.com/hhff/ember-infinity/issues/33)
- Possibility to reset infinityloader via controller [\#31](https://github.com/hhff/ember-infinity/issues/31)
- documentation of infinityModelUpdated and infinityModelLoaded [\#28](https://github.com/hhff/ember-infinity/issues/28)
- upgrade from 0.0.4 to 0.0.8 causes Cannot find module 'ember-cli-version-checker' [\#27](https://github.com/hhff/ember-infinity/issues/27)
- Incorrect error message in addon/mixins/route.js [\#25](https://github.com/hhff/ember-infinity/issues/25)
- Will not load more if still in view [\#10](https://github.com/hhff/ember-infinity/issues/10)

**Merged pull requests:**

- check if in view on resize events [\#45](https://github.com/hhff/ember-infinity/pull/45) ([kellyselden](https://github.com/kellyselden))
- keep loading until you are out of view [\#44](https://github.com/hhff/ember-infinity/pull/44) ([kellyselden](https://github.com/kellyselden))
- Updated with documentation on `infinityModelLoaded` and `infinityMode… [\#41](https://github.com/hhff/ember-infinity/pull/41) ([ashrafhasson](https://github.com/ashrafhasson))
- More badges for readme [\#39](https://github.com/hhff/ember-infinity/pull/39) ([mike-north](https://github.com/mike-north))
- Update to ember-cli 0.2.7 [\#38](https://github.com/hhff/ember-infinity/pull/38) ([mike-north](https://github.com/mike-north))
- \[gh-pages\] Add babel.js polyfill to demo [\#37](https://github.com/hhff/ember-infinity/pull/37) ([mike-north](https://github.com/mike-north))
- Babel.js polyfill in demo app [\#36](https://github.com/hhff/ember-infinity/pull/36) ([mike-north](https://github.com/mike-north))
- uses the override properties when loading more [\#35](https://github.com/hhff/ember-infinity/pull/35) ([kellyselden](https://github.com/kellyselden))

## [v0.0.9](https://github.com/hhff/ember-infinity/tree/v0.0.9) (2015-06-12)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.8...v0.0.9)

**Merged pull requests:**

- fixed wrong error message [\#26](https://github.com/hhff/ember-infinity/pull/26) ([cgwic](https://github.com/cgwic))

## [v0.0.8](https://github.com/hhff/ember-infinity/tree/v0.0.8) (2015-06-01)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.7...v0.0.8)

**Merged pull requests:**

- Add Demo URL to package.json [\#24](https://github.com/hhff/ember-infinity/pull/24) ([hhff](https://github.com/hhff))
- Update ember-cli-github-pages & Readme [\#23](https://github.com/hhff/ember-infinity/pull/23) ([mike-north](https://github.com/mike-north))
- GitHub pages demo [\#22](https://github.com/hhff/ember-infinity/pull/22) ([mike-north](https://github.com/mike-north))

## [v0.0.7](https://github.com/hhff/ember-infinity/tree/v0.0.7) (2015-05-21)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.6...v0.0.7)

**Merged pull requests:**

- ES6-ification [\#21](https://github.com/hhff/ember-infinity/pull/21) ([mike-north](https://github.com/mike-north))
- Ember cli 0.2.5 [\#20](https://github.com/hhff/ember-infinity/pull/20) ([mike-north](https://github.com/mike-north))
- adds json response to README.md [\#19](https://github.com/hhff/ember-infinity/pull/19) ([mockra](https://github.com/mockra))
- Allow customization of pagination API [\#18](https://github.com/hhff/ember-infinity/pull/18) ([mike-north](https://github.com/mike-north))

## [v0.0.6](https://github.com/hhff/ember-infinity/tree/v0.0.6) (2015-05-18)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.5...v0.0.6)

**Closed issues:**

- ember-cli-version-checker dependency [\#16](https://github.com/hhff/ember-infinity/issues/16)

**Merged pull requests:**

- Add version checker to deps, closes \#16 [\#17](https://github.com/hhff/ember-infinity/pull/17) ([hhff](https://github.com/hhff))

## [v0.0.5](https://github.com/hhff/ember-infinity/tree/v0.0.5) (2015-04-30)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.4...v0.0.5)

**Closed issues:**

- \[Suggestion\] For integration with backends other than Kaminari [\#12](https://github.com/hhff/ember-infinity/issues/12)

**Merged pull requests:**

- Adding ability to change default model path [\#15](https://github.com/hhff/ember-infinity/pull/15) ([Keeo](https://github.com/Keeo))
- Fixes install command for new ember-cli [\#14](https://github.com/hhff/ember-infinity/pull/14) ([Keeo](https://github.com/Keeo))
- Add descriptive error message when running ember-cli \< 0.2.0 [\#13](https://github.com/hhff/ember-infinity/pull/13) ([amedrz](https://github.com/amedrz))

## [v0.0.4](https://github.com/hhff/ember-infinity/tree/v0.0.4) (2015-04-08)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.3...v0.0.4)

**Closed issues:**

- Normalize parameters passed to infinityModel [\#11](https://github.com/hhff/ember-infinity/issues/11)
- Unable to send along extra options [\#6](https://github.com/hhff/ember-infinity/issues/6)
- \_bindScroll in infinity-loader.js sets wrong scroll element [\#5](https://github.com/hhff/ember-infinity/issues/5)
- Cannot read property 'name' of undefined [\#3](https://github.com/hhff/ember-infinity/issues/3)

**Merged pull requests:**

- Support additional parameters for infinityModel\(\) [\#9](https://github.com/hhff/ember-infinity/pull/9) ([bruce](https://github.com/bruce))
- Fixed h2 tag [\#8](https://github.com/hhff/ember-infinity/pull/8) ([Mak-Di](https://github.com/Mak-Di))

## [v0.0.3](https://github.com/hhff/ember-infinity/tree/v0.0.3) (2015-03-25)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.2...v0.0.3)

**Merged pull requests:**

- Add scrollable to README [\#4](https://github.com/hhff/ember-infinity/pull/4) ([hhff](https://github.com/hhff))
- Add option to specify scrollable element [\#2](https://github.com/hhff/ember-infinity/pull/2) ([greis](https://github.com/greis))

## [v0.0.2](https://github.com/hhff/ember-infinity/tree/v0.0.2) (2015-03-22)
[Full Changelog](https://github.com/hhff/ember-infinity/compare/v0.0.1...v0.0.2)

**Merged pull requests:**

- infiniteModel -\> infinityModel [\#1](https://github.com/hhff/ember-infinity/pull/1) ([hhff](https://github.com/hhff))

## [v0.0.1](https://github.com/hhff/ember-infinity/tree/v0.0.1) (2015-03-22)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
