/**
 * Scans an array of imports, and determines which identifiers
   are readonly, and which cannot be assigned to. For example
   you cannot `import foo from 'foo'` then do `foo = 42`, nor
   can you `import * as foo from 'foo'` then do `foo.answer = 42`
 * @param {array} imports - the array of imports
 * @returns {array} [ importedBindings, importedNamespaces ]
 */
export default function getReadOnlyIdentifiers ( imports ) {
	var importedBindings = {}, importedNamespaces = {};

	imports.forEach( x => {
		if ( x.passthrough ) return;

		x.specifiers.forEach( s => {
			if ( s.isBatch ) {
				importedNamespaces[ s.as ] = true;
			} else {
				importedBindings[ s.as ] = true;
			}
		});
	});

	return [ importedBindings, importedNamespaces ];
}