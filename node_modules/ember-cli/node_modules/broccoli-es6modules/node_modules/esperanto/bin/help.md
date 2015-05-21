  Esperanto version <%= version %>
  =====================================

  Usage: esperanto [options]

  Basic options:

    -v, --version            Show version number
    -h, --help               Show this help message
    -i, --input              Input file (if absent, reads from stdin)
    -o, --output <output>    Output file (if absent, prints to stdout)
    -t, --type [amd]         Type of output (amd, cjs, umd)
    -s, --strict             Use strict mode
    -b, --bundle             Create a bundle including <file>'s dependencies
    -n, --name               Name for UMD export
    -a, --amdName            Name for AMD module (default is anonymous)
    -m, --sourcemap          Generate sourcemap (`-m inline` for inline map)

  Additional options when bundling

    -d, --basedir=<basedir>  Base directory for module resolution
    -k, --skip=<files...>    Comma-separated list of files to skip (relative to basedir)


  Example:

    esperanto --type=cjs --output=build/app.js --bundle -- src/app.js


  Notes:

    * You must supply an --input option when bundling (i.e. no piping from stdin)
    * Non-inline sourcemaps will be discarded when piping to stdout

  For more information visit https://github.com/Rich-Harris/esperanto/wiki
