#!/usr/bin/env node

var minimist = require( 'minimist' ),
	command;

command = minimist( process.argv.slice( 2 ), {
	alias: {
		i: 'input',
		o: 'output',
		v: 'version',
		h: 'help',
		b: 'bundle',
		s: 'strict',
		t: 'type',
		m: 'sourcemap',
		n: 'name',
		d: 'basedir',
		k: 'skip',
		a: 'amdName'
	}
});

if ( command.help || ( process.argv.length <= 2 && process.stdin.isTTY ) ) {
	require( './showHelp' )();
}

else if ( command.version ) {
	console.log( 'Esperanto version ' + require( '../package.json' ).version );
}

else {
	require( './runEsperanto' )( command );
}