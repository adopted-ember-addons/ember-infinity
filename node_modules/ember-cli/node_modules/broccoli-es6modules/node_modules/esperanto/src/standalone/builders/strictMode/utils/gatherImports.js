export default function gatherImports ( imports ) {
	let chains = {};
	let identifierReplacements = {};

	imports.forEach( x => {
		x.specifiers.forEach( s => {
			if ( s.isBatch ) {
				return;
			}

			let name = s.as;
			let replacement = x.name + ( s.isDefault ? `['default']` : `.${s.name}` );

			if ( !x.passthrough ) {
				identifierReplacements[ name ] = replacement;
			}

			chains[ name ] = replacement;
		});
	});

	return [ chains, identifierReplacements ];
}
