import packageResult from 'utils/packageResult';
import getExportBlock from './utils/getExportBlock';
import { req } from 'utils/mappers';

export default function cjs ( bundle, options ) {
	let entry = bundle.entryModule;

	let importBlock = bundle.externalModules.map( x => {
		let statement = `var ${x.name} = ${req(x.id)};`;

		if ( x.needsDefault ) {
			statement += '\n' +
				( x.needsNamed ? `var ${x.name}__default` : x.name ) +
				` = ('default' in ${x.name} ? ${x.name}['default'] : ${x.name});`;
		}

		return statement;
	}).join( '\n' );

	if ( importBlock ) {
		bundle.body.prepend( importBlock + '\n\n' );
	}

	if ( entry.defaultExport ) {
		bundle.body.append( '\n\n' + getExportBlock( entry ) );
	}

	if ( options.useStrict !== false ) {
		bundle.body.prepend("'use strict';\n\n").trimLines();
	}

	return packageResult( bundle, bundle.body, options, 'toCjs', true );
}
