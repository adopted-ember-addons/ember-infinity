import hasOwnProp from 'utils/hasOwnProp';

export default function resolveChains ( modules, moduleLookup ) {
	var chains = {};

	// First pass - resolving intra-module chains
	modules.forEach( mod => {
		var origin = {};

		mod.imports.forEach( x => {
			const imported = x.module;

			x.specifiers.forEach( s => {
				if ( s.isBatch ) {
					// tell that module that it needs to export an object full of getters
					imported._exportsNamespace = true;
					return; // TODO can batch imports be chained?
				}

				origin[ s.as ] = `${s.name}@${imported.id}`;
			});
		});

		mod.exports.forEach( x => {
			if ( !x.specifiers ) return;

			x.specifiers.forEach( s => {
				if ( hasOwnProp.call( origin, s.name ) ) {
					chains[ `${s.name}@${mod.id}` ] = origin[ s.name ];
				}
			});
		});
	});

	// Second pass - assigning origins to specifiers
	modules.forEach( mod => {
		mod.imports.forEach( x => {
			const imported = x.module;

			x.specifiers.forEach( s => {
				if ( s.isBatch ) {
					return; // TODO can batch imports be chained?
				}

				setOrigin( s, `${s.name}@${imported.id}`, chains, moduleLookup );
			});
		});

		mod.exports.forEach( x => {
			if ( !x.specifiers ) return;

			x.specifiers.forEach( s => {
				setOrigin( s, `${s.name}@${mod.id}`, chains, moduleLookup );
			});
		});
	});
}

function setOrigin ( specifier, hash, chains, moduleLookup ) {
	let isChained;

	while ( hasOwnProp.call( chains, hash ) ) {
		hash = chains[ hash ];
		isChained = true;
	}

	if ( isChained ) {
		const [ name, moduleId ] = hash.split( '@' );
		specifier.origin = { module: moduleLookup[ moduleId ], name };
	}
}
