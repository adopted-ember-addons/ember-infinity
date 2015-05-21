test = require('tap').test
testHelpers = require('./broccoli_test_helpers')
mergeTrees = require('../')

makeFixtureTree = testHelpers.makeFixtureTree
treeToFixture = testHelpers.treeToFixture
dereferenceSymlinks = testHelpers.dereferenceSymlinks

mergeFixtures = (inputFixtures, options) ->
  treeToFixture dereferenceSymlinks(mergeTrees(inputFixtures.map(makeFixtureTree), options))

test 'mergeTrees', (t) ->
  test 'files and symlinks', (t) ->
    t.plan 1
    mergeFixtures [
      foo: '1'
      bar: ['foo'] # symlink
    ,
      baz: '2'
    ]
    .then (out) -> t.deepEqual out,
      foo: '1'
      bar: '1'
      baz: '2'

  test 'refuses to overwrite files by default', (t) ->
    t.plan 1
    mergeFixtures [
      foo: '1a'
      bar: '2a'
    ,
      foo: '1b'
      bar: '2b'
    ]
    .catch (err) ->
      t.similar err.message, /Merge error: file bar exists in .* and [^]* overwrite: true/

  test 'accepts { overwrite: true }', (t) ->
    t.plan 1
    mergeFixtures [
      foo: '1a'
      bar: '2'
      baz: ['foo'] # symlink
    ,
      foo: '1b'
      bar: ['foo']
      baz: '3'
    ,
      foo: '1c'
    ], overwrite: true
    .then (out) -> t.deepEqual out,
      foo: '1c'
      bar: '1b'
      baz: '3'

  test 'refuses to honor conflicting capitalizations', (t) ->
    t.plan 4

    for overwrite in [false, true] # non-essential: fails with overwrite: true and false
      for content in ['1', {}] # file or directory
        mergeFixtures [
          FOO: content
        ,
          Foo: content
        ], overwrite: overwrite
        .catch (err) ->
          t.similar err.message, /Merge error: conflicting capitalizations:\nFOO in .*\nFoo in .*\nRemove/

  test 'directories', (t) ->
    t.plan 1
    mergeFixtures [
      subdir:
        foo: '1'
    ,
      subdir2: {}
    ,
      subdir:
        bar: '2'
    ]
    .then (out) -> t.deepEqual out,
      subdir:
        foo: '1'
        bar: '2'
      subdir2: {}

  test 'directory collision with file', (t) ->
    t.plan 4
    for overwrite in [false, true] # non-essential: fails with overwrite: true and false
      mergeFixtures [
        foo: {}
      ,
        foo: '1'
      ], overwrite: overwrite
      .catch (err) =>
        t.similar err.message, /Merge error: conflicting file types: foo is a directory in .* but a file in .*/

      mergeFixtures [
        foo: '1'
      ,
        foo: {}
      ], overwrite: overwrite
      .catch (err) =>
        t.similar err.message, /Merge error: conflicting file types: foo is a file in .* but a directory in .*/

  t.end()
