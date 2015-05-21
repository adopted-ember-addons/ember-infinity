#v0.0.5
- Pass through arguments to commands (allows `ember try ember-canary test --server`)
- `--skip-cleanup` option for commands `try` and `try:testall` to not restore the default bower dependency set. This is useful in CI environments when the build is being thrown out and not deployed.
- Change built-in scenarios: Now the default includes Ember release, beta and canary as well as a default scenario which uses the version(s) specified in bower.json

#v0.0.4
- Do not require global `bower` or `ember` commands.

#v0.0.3
- Bugfix: `ember try` was always returning non-zero
- Can now specify resolutions under each scenario
- Remove runtime dependency on `ember-cli`
- Remove dependency on git

#v0.0.2
- Make use of bower resolutions to avoid prompts during install
- Warn instead of error if versions specified do not match those in `bower_components/<packageName>/bower.json`
- Update default config to include new Ember versions (Thanks @rwjblue)

#v0.0.1
- Initial version
