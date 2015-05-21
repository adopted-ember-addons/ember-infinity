import packageResult from 'utils/packageResult';
import hasOwnProp from 'utils/hasOwnProp';
import transformBody from './utils/transformBody';
import { req } from 'utils/mappers';

export default function cjs ( mod, options ) {
	let seen = {};

	// Create block of require statements
	let importBlock = mod.imports.map( x => {
		if ( !hasOwnProp.call( seen, x.path ) ) {
			seen[ x.path ] = true;

			if ( x.isEmpty ) {
				return `${req(x.path)};`;
			}

			return `var ${x.name} = ${req(x.path)};`;
		}
	}).filter( Boolean ).join( '\n' );

	transformBody( mod, mod.body, {
		header: importBlock,
		_evilES3SafeReExports: options._evilES3SafeReExports
	});

	if ( options.useStrict !== false ) {
		mod.body.prepend( "'use strict';\n\n" ).trimLines();
	}

	return packageResult( mod, mod.body, options, 'toCjs' );
}
