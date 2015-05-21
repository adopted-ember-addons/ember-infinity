const RESERVED = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield'.split( ' ' );
const INVALID_CHAR = /[^a-zA-Z0-9_$]/g;
const INVALID_LEADING_CHAR = /[^a-zA-Z_$]/;

/**
 * Generates a sanitized (i.e. valid identifier) name from a module ID
 * @param {string} id - a module ID, or part thereof
 * @returns {string}
 */
export default function sanitize ( name ) {
	name = name.replace( INVALID_CHAR, '_' );

	if ( INVALID_LEADING_CHAR.test( name[0] ) || ~RESERVED.indexOf( name ) ) {
		name = `_${name}`;
	}

	return name;
}

var pathSplitRE = /\/|\\/;
export function splitPath ( path ) {
	return path.split( pathSplitRE );
}
