var chalk = require( 'chalk' );

var handlers = {
	MISSING_INPUT_OPTION: function () {
		console.error( chalk.red( 'You must specify an --input (-i) option when bundling' ) );
	},

	MISSING_OUTPUT_OPTION: function () {
		console.error( chalk.red( 'You must specify an --output (-o) directory option when converting a directory of files' ) );
	},

	NO_INPUT_DETECTED: function () {
		console.error( chalk.red( 'No input detected! Try using the --input (-i) option' ) );
	},

	MISSING_NAME: function ( err ) {
		console.error( chalk.red( 'You must supply a name for UMD exports (e.g. `--name myModule`)' ) );
	}
};

module.exports = function handleError ( err ) {
	var handler;

	if ( handler = handlers[ err && err.code ] ) {
		handler( err );
	} else {
		console.error( chalk.red( err.message || err ) );

		if ( err.stack ) {
			console.error( chalk.grey( err.stack ) );
		}
	}

	console.error( 'Type ' + chalk.cyan( 'esperanto --help' ) + ' for help, or visit https://github.com/esperantojs/esperanto/wiki' );

	process.exit( 1 );
};
