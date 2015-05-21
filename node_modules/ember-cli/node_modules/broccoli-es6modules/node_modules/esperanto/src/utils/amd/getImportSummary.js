import resolveId from '../resolveId';

export default function getImportSummary ({ imports, absolutePaths, name }) {
	let paths = [];
	let names = [];
	let seen = {};
	let placeholders = 0;

	imports.forEach( x => {
		let path = x.id || x.path; // TODO unify these

		if ( !seen[ path ] ) {
			seen[ path ] = true;

			paths.push( path );

			// TODO x could be an external module, or an internal one.
			// they have different shapes, resulting in the confusing
			// code below
			if ( ( x.needsDefault || x.needsNamed ) || ( x.specifiers && x.specifiers.length ) ) {
				while ( placeholders ) {
					names.push( `__dep${names.length}__` );
					placeholders--;
				}
				names.push( x.name );
			} else {
				placeholders++;
			}
		}
	});

	let ids = absolutePaths ? paths.map( relativePath => resolveId( relativePath, name ) ) : paths.slice();

	return { ids, paths, names };
}