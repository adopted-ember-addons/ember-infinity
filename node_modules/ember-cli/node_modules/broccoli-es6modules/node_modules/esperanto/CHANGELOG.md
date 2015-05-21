# changelog

## 0.6.34

* Improve module sorting algorithm to handle tricky cyclical cases ([#159](https://github.com/esperantojs/esperanto/issues/159))

## 0.6.33

* Fix a separate 0.6.31 regression with external modules ([#158](https://github.com/esperantojs/esperanto/issues/158))

## 0.6.32

* Fix regression introduce in 0.6.31, whereby modules within a bundle are prevented from depending on the entry module

## 0.6.31

* Preserve trailing `.js` in external module names (e.g. [highlight.js](https://www.npmjs.com/package/highlight.js)) ([#155](https://github.com/esperantojs/esperanto/issues/155))
* Fix naming bug with modules imported via both `resolvePath` and normal import ([#156](https://github.com/esperantojs/esperanto/issues/156))

## 0.6.30

* Mutually dependent modules within a bundle are re-ordered based on whether one is referenced at the top level of the other ([#152](https://github.com/esperantojs/esperanto/issues/152))

## 0.6.29

* Relative source URLs in sourcemaps are correct
* `src` directory included in npm package

## 0.6.28

* `resolvePath` option is not required to return a path (e.g. `esperanto.toAmd({ code, ast })`) ([#148](https://github.com/esperantojs/esperanto/issues/148))

## 0.6.27

* AST can be supplied when doing one-to-one transformations (e.g. `esperanto.toAmd({ code, ast })`) ([#140](https://github.com/esperantojs/esperanto/issues/140))
* Modules can be supplied directly when bundling, rather than reading from disk ([docs here](https://github.com/esperantojs/esperanto/wiki/Bundling-multiple-ES6-modules#modules)) ([#140](https://github.com/esperantojs/esperanto/issues/140))
* 'use strict' pragma is omitted if `useStrict: false` option is supplied ([#141](https://github.com/esperantojs/esperanto/issues/141))

## 0.6.26

* AST walker handles sparse arrays ([#144](https://github.com/esperantojs/esperanto/issues/144))

## 0.6.25

* Reliable updating of exported expressions ([#142](https://github.com/esperantojs/esperanto/issues/142))

## 0.6.24

* Renamed exports (`export { foo as bar }`) works
* Internal tidy up/refactoring, resulting in smaller library

## 0.6.23

* Function arguments are considered when naming imports to avoid conflicts ([#119](https://github.com/esperantojs/esperanto/issues/119))
* Bindings are always exported at the end of a module, regardless of re-assignments ([#130](https://github.com/esperantojs/esperanto/issues/130))
* Generated import names cannot be shadowed by non-root-scope declarations ([#133](https://github.com/esperantojs/esperanto/issues/133))

## 0.6.22

* Allow imports to be re-exported ([#124](https://github.com/esperantojs/esperanto/issues/124))

## 0.6.21

* Fix npm versioning snafu

## 0.6.20

* Replaced estraverse with internal utility that doesn't depend on hardcoded node types to traverse AST ([#129](https://github.com/esperantojs/esperanto/issues/129))

## 0.6.19

* Sourcemap comments are removed from bundles as well as one-to-one transformations ([#120](https://github.com/esperantojs/esperanto/issues/120))

## 0.6.18

* Upgrade to acorn v1.x ([#125](https://github.com/esperantojs/esperanto/issues/125))
* Sourcemap comments from prior transformations are removed ([#120](https://github.com/esperantojs/esperanto/issues/120))
* Named function expressions are not erroneously renamed ([#122](https://github.com/esperantojs/esperanto/issues/122))

## 0.6.17

* Sourcemap mappings are set explicitly - rather than mapping every single character, the locations from the acorn AST are used. As well as smaller sourcemaps, this results in modest performance improvements internally, and large performance improvements for external tools that work with the sourcemap

## 0.6.16

* Prevent import naming collisions ([#116](https://github.com/esperantojs/esperanto/issues/116))
* Throw error on duplicate imports ([#95](https://github.com/esperantojs/esperanto/issues/95))
* Prevent internal assigment exports clashing within a bundle ([#117](https://github.com/esperantojs/esperanto/issues/117))
* Update chalk to 1.0.0

## 0.6.15

* Clashes with names for external dependencies are avoided ([#114](https://github.com/esperantojs/esperanto/issues/114))

## 0.6.14

* The `sourceMapFile` requirement is waived when `options.sourceMap === 'inline'` ([#105](https://github.com/esperantojs/esperanto/issues/105))

## 0.6.13

* Windows fixes

## 0.6.12

* Bundled external modules are deduplicated in the rare case that they import themselves ([#103](https://github.com/esperantojs/esperanto/issues/103))

## 0.6.11

* Use robust `module.relativePath` internally rather than `module.file` - necessary for bundled external modules with dependencies of their own
* Browser-flavoured version of Esperanto (`dist/esperanto.browser.js`) bundles ES6 dependencies (`magic-string` and its `vlq` dependency), as both a convenience and a form of dogfooding

## 0.6.10

* The `resolvePath` option can be used with `esperanto.bundle()` to locate modules, if they do not exist relative to `base`. It should return an absolute path as a string, or a promise that resolves to one ([#68](https://github.com/esperantojs/esperanto/issues/68))

## 0.6.9

* `sourceMapFile` can be an absolute path, in which case it is left unchanged ([#101](https://github.com/esperantojs/esperanto/issues/101))

## 0.6.8

* Module load order is guaranteed by import order - empty imports are represented by `__dep0__` etc within the module, or `undefined` globally ([#92](https://github.com/esperantojs/esperanto/issues/92))
* Fix absolute path resolution in cases like `./../foo` ([#97](https://github.com/esperantojs/esperanto/issues/97))
* If `bundle.concat()` fails due to external dependencies, or exports from the entry module, the error message lists them

## 0.6.7

* Using the `_evilES3SafeReExports` will cause re-exported bindings to be done with direct property assignment rather than `Object.defineProperty()`. In most cases, the resulting behaviour will be no different, but it could result in undefined bindings in cases of cyclical dependencies, and values are fixed at the time of re-export rather than live.

## 0.6.6

* Conflicts between module names and unscoped (i.e. global) names and `exports` are prevented ([#74](https://github.com/esperantojs/esperanto/issues/74)), ([#79](https://github.com/esperantojs/esperanto/issues/79))
* Names in function expressions (as opposed to declarations) are disregarded ([#73](https://github.com/esperantojs/esperanto/issues/73))
* Re-exports remain enumerable
* Continuous integration via Travis-CI

## 0.6.5

* Relative AMD dependency paths can be made absolute with `absolutePaths: true` - requires `amdName` to be specified ([#58](https://github.com/esperantojs/esperanto/issues/58))
* Within a bundle, built-in names like `Math` and `Promise` are avoided ([#70](https://github.com/esperantojs/esperanto/issues/70))
* Bundle imports and exports are reported as `bundle.imports` and `bundle.exports` ([#59](https://github.com/esperantojs/esperanto/issues/59))

## 0.6.4

* Fixes duplicate import bug ([#63](https://github.com/esperantojs/esperanto/issues/63))
* Module names are correctly escaped ([#50](https://github.com/esperantojs/esperanto/issues/50))
* Accessing properties on top-level `this` throws error at parse time
* CLI: if no `--output` option is given, bundle is written to stdout (if no separate sourcemap) ([#60](https://github.com/esperantojs/esperanto/issues/60))
* CLI: Better errors ([#66](https://github.com/esperantojs/esperanto/issues/66))
* Test suite refactor

## 0.6.3

* Support for Windows file paths
* `bundle.concat()` can be called without an options argument
* Options argument passed to `bundle.concat()` can include `intro`, `outro`, `indent` properties which will override defaults (`indent: true` is equivalent to 'automatic', otherwise pass a string)
* Bundle transform function can return an empty string

## 0.6.2

* Implement `bundle.concat()` for self-contained bundles ([#48](https://github.com/esperantojs/esperanto/issues/48))

## 0.6.1

* Fix for ([#45](https://github.com/esperantojs/esperanto/issues/45))
* External modules only have `__default` appended where necessary ([#46](https://github.com/esperantojs/esperanto/issues/46))

## 0.6.0

* UMD export detects CJS environment *before* AMD ([#42](https://github.com/esperantojs/esperanto/issues/42))
* `this` at module top-level is replaced with `undefined`, as per the spec ([#43](https://github.com/esperantojs/esperanto/issues/43))
* More compact CommonJS export
* Bundler transform function receives path as second argument

## 0.5.10

* One-to-one conversions get the same compact UMD form as bundles
* Default imports are not hedged unnecessarily ([#40](https://github.com/esperantojs/esperanto/issues/40))

## 0.5.9

* More concise UMD output ([#36](https://github.com/esperantojs/esperanto/issues/36))

## 0.5.8

* Functions are always exported early ([#37](https://github.com/esperantojs/esperanto/issues/37))
* Modules can be transformed before bundling with `esperanto.bundle({ transform: someFunction })`, where `someFunction` returns either a string, or a promise that resolves to a string

## 0.5.7

* Classes are exported after declaration, not before ([#33](https://github.com/esperantojs/esperanto/issues/33))

## 0.5.6

* Support for named AMD modules, via `amdName` option (works for both standalone and bundle conversions)

## 0.5.5

* No actual changes - just shuffling things about so we can separate demo page into separate repo

## 0.5.4

* Performance improvements and internal refactoring

## 0.5.3

* You can specify a `banner` and/or `footer` option when converting or bundling
* An error will be thrown if a module attempts to import itself

## 0.5.2

* Imported objects (other than namespace imports) can be assigned properties ([#29](https://github.com/esperantojs/esperanto/issues/29))
* Default imports can be exported as named exports from the entry module in a bundle

## 0.5.1

* Identifiers that match object prototype properties are not mistakenly exported (and garbled)

## 0.5.0

* Chained imports/exports are renamed correctly within a bundle ([#17](https://github.com/esperantojs/esperanto/issues/17))
* Bundle exports are written at assignment time, rather than at the end of the bundle with an `Object.defineProperty` hack
* Attempting to import a non-exported identifier within the same bundle throws an error
* External modules are imported correctly ([#28](https://github.com/esperantojs/esperanto/issues/28))
* Identifiers are only rewritten as necessary ([#25](https://github.com/esperantojs/esperanto/issues/25))
* Redundant assignments in a bundle (`mod__default = mod__foo`) are avoided ([#14](https://github.com/esperantojs/esperanto/issues/14))
* Shadowed imports are handled ([#18](https://github.com/esperantojs/esperanto/issues/18))
* Modules are indented consistently within a bundle

## 0.4.10

* Update acorn (greater ES6 coverage) and estraverse dependencies - thanks [@leebyron](https://github.com/leebyron)

## 0.4.9

* Adds `class` support - thanks [@leebyron](https://github.com/leebyron)
* Use `hasOwnProperty` check to prevent garbled output - thanks [@leebyron](https://github.com/leebyron)

## 0.4.8

* `exports['default']` is used in favour of `exports.default`, for the benefit of IE8 - thanks [@evs-chris](https://github.com/evs-chris/)

## 0.4.7

* In standalone conversions, import names are inferred from the source code where possible (batch/default imports), and will avoid naming collisions ([#15](https://github.com/esperantojs/esperanto/issues/15))

## 0.4.6

* Fix missing closing parenthesis on strict mode UMD output

## 0.4.5

* Only print `defaultOnly` deprecation warning once, rather than flooding the console

## 0.4.4

* Parse errors (from acorn) are augmented with file info when bundling

## 0.4.3

* Added CLI files to npm package (oops!)

## 0.4.2

* Sourcemap support for bundles

## 0.4.1

* Command line interface
* Sourcemap support for one-to-one conversions
* Neater UMD exports
* Remove `addUseStrict` option (ES6 modules are always in strict mode)

## 0.4.0

* Started maintaining a changelog
* Complete rewrite!
* Spec-compliance - Esperanto now supports bindings and cycles (only in [strict mode](https://github.com/Rich-Harris/esperanto/wiki/strictMode))
* The `defaultOnly` option has been deprecated - esperanto's standard behaviour is now to import and exports defaults. If you want to use named imports/exports, pass `strict: true` (this basically means that your default export becomes `exports.default` rather than `module.exports`). For more information see the [wiki page on strict mode](https://github.com/Rich-Harris/esperanto/wiki/strictMode)
* UMD output: `esperanto.toUmd(es6source, {name:'myModule'});
* Bundling - see the [wiki page on esperanto.bundle()](https://github.com/Rich-Harris/esperanto/wiki/esperanto-bundle)
