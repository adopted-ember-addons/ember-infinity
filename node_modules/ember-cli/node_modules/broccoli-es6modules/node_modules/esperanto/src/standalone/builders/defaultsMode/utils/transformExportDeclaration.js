export default function transformExportDeclaration ( declaration, body ) {
	if ( !declaration ) {
		return;
	}

	let exportedValue;

	switch ( declaration.type ) {
		case 'namedFunction':
		case 'namedClass':
			body.remove( declaration.start, declaration.valueStart );
			exportedValue = declaration.name;
			break;

		case 'anonFunction':
		case 'anonClass':
			if ( declaration.isFinal ) {
				body.replace( declaration.start, declaration.valueStart, 'return ' );
			} else {
				body.replace( declaration.start, declaration.valueStart, 'var __export = ' );
				exportedValue = '__export';
			}

			// add semi-colon, if necessary
			// TODO body.original is an implementation detail of magic-string - there
			// should probably be an API for this sort of thing
			if ( body.original[ declaration.end - 1 ] !== ';' ) {
				body.insert( declaration.end, ';' );
			}

			break;

		case 'expression':
			body.remove( declaration.start, declaration.next );
			exportedValue = declaration.value;
			break;

		default:
			throw new Error( `Unexpected export type '${declaration.type}'` );
	}

	if ( exportedValue ) {
		body.append( `\nreturn ${exportedValue};` );
	}
}
