# Change Log

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