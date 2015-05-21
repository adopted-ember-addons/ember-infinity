import walk from './ast/walk';
import { splitPath } from 'utils/sanitize';

const ABSOLUTE_PATH = /^(?:[A-Z]:)?[\/\\]/i;

let warned = {};

export default function packageResult ( bundleOrModule, body, options, methodName, isBundle ) {
	// wrap output
	if ( options.banner ) body.prepend( options.banner );
	if ( options.footer ) body.append( options.footer );

	let code = body.toString();
	let map;

	if ( !!options.sourceMap ) {
		if ( options.sourceMap !== 'inline' && !options.sourceMapFile ) {
			throw new Error( 'You must provide `sourceMapFile` option' );
		}

		if ( !isBundle && !options.sourceMapSource ) {
			throw new Error( 'You must provide `sourceMapSource` option' );
		}

		let sourceMapFile;
		if ( options.sourceMap === 'inline' ) {
			sourceMapFile = null;
		} else {
			sourceMapFile = ABSOLUTE_PATH.test( options.sourceMapFile ) ? options.sourceMapFile : './' + splitPath( options.sourceMapFile ).pop();
		}

		if ( isBundle ) {
			markBundleSourcemapLocations( bundleOrModule );
		} else {
			markModuleSourcemapLocations( bundleOrModule );
		}

		map = body.generateMap({
			includeContent: true,
			file: sourceMapFile,
			source: ( sourceMapFile && !isBundle ) ? getRelativePath( sourceMapFile, options.sourceMapSource ) : null
		});

		if ( options.sourceMap === 'inline' ) {
			code += '\n//# sourceMa' + 'ppingURL=' + map.toUrl();
			map = null;
		} else {
			code += '\n//# sourceMa' + 'ppingURL=' + sourceMapFile + '.map';
		}
	} else {
		map = null;
	}

	return {
		code,
		map,
		toString () {
			if ( !warned[ methodName ] ) {
				console.log( `Warning: esperanto.${methodName}() returns an object with a 'code' property. You should use this instead of using the returned value directly` );
				warned[ methodName ] = true;
			}

			return code;
		}
	};
}

function getRelativePath ( from, to ) {
	var fromParts, toParts, i;

	fromParts = splitPath( from );
	toParts = splitPath( to );

	fromParts.pop(); // get dirname

	while ( fromParts[0] === '.' ) {
		fromParts.shift();
	}

	while ( fromParts[0] === toParts[0] ) {
		fromParts.shift();
		toParts.shift();
	}

	if ( fromParts.length ) {
		i = fromParts.length;
		while ( i-- ) fromParts[i] = '..';

		return fromParts.concat( toParts ).join( '/' );
	} else {
		toParts.unshift( '.' );
		return toParts.join( '/' );
	}
}

function markBundleSourcemapLocations ( bundle ) {
	bundle.modules.forEach( mod => {
		walk( mod.ast, {
			enter: node => {
				mod.body.addSourcemapLocation( node.start );
			}
		});
	});
}

function markModuleSourcemapLocations ( mod ) {
	walk( mod.ast, {
		enter: node => {
			mod.body.addSourcemapLocation( node.start );
		}
	});
}
