import packageResult from 'utils/packageResult';
import { req } from 'utils/mappers';

export default function cjs ( bundle, options ) {
	let importBlock = bundle.externalModules.map( x => {
		return `var ${x.name} = ${req(x.id)};`;
	}).join( '\n' );

	if ( importBlock ) {
		bundle.body.prepend( importBlock + '\n\n' );
	}

	let defaultName = bundle.entryModule.identifierReplacements.default;
	if ( defaultName ) {
		bundle.body.append( `\n\nmodule.exports = ${defaultName};` );
	}

	if ( options.useStrict !== false ) {
		bundle.body.prepend("'use strict';\n\n").trimLines();
	}

	return packageResult( bundle, bundle.body, options, 'toCjs', true );
}
