var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var crc32 = require( 'buffer-crc32' );
var sander = require( '../' );

process.chdir( __dirname );

sander.rimrafSync( 'output' );

tests = [
	{
		name: 'copydir',
		test: function () {
			return sander.copydir( 'input', 'dir' ).to( 'output', '1' ).then( function () {
				checkEquality([ 'input', 'dir' ], [ 'output', '1' ]);
			});
		}
	},

	{
		name: 'appendFile',
		test: function () {
			return sander.writeFile( 'output/2/test.txt', 'first line' )
				.then( function () {
					return sander.appendFile( 'output/2/test.txt', '\nsecond line' )
				})
				.then( function () {
					return sander.readFile( 'output/2/test.txt' )
						.then( String )
						.then( function ( combined ) {
							assert.equal( combined, 'first line\nsecond line' );
						});
				});
		}
	}
];

runNextTest();

function runNextTest () {
	var test = tests.shift(),
		promise;

	if ( !test ) {
		console.log( 'done' );
		return;
	}

	promise = test.test();

	if ( promise && typeof promise.then === 'function' ) {
		promise.then( runNextTest ).catch( function ( err ) {
			setTimeout( function () {
				throw err;
			});
		});
	} else {
		runNextTest();
	}
}

function checkEquality ( a, b ) {
	var statsA, statsB, filesA, filesB, crcA, crcB;

	a = path.resolve.apply( null, a );
	b = path.resolve.apply( null, b );

	statsA = fs.statSync( a );
	statsB = fs.statSync( b );

	if ( statsA.isDirectory() ) {
		assert.ok( statsB.isDirectory(),  a + ' is a directory but ' + b + ' is not' );

		filesA = fs.readdirSync( a );
		filesB = fs.readdirSync( b );

		assert.ok( compareArrays( filesA, filesB ) );

		i = filesA.length;
		while ( i-- ) {
			checkEquality([ a, filesA[i] ], [ b, filesB[i] ]);
		}
	}

	else {
		crcA = crc32( fs.readFileSync( a ) );
		crcB = crc32( fs.readFileSync( b ) );

		assert.equal( crcA.toString(), crcB.toString() );
	}
}

function compareArrays ( a, b ) {
	var i = a.length;

	if ( b.length !== i ) {
		return false;
	}

	a.sort();
	b.sort();

	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
}
