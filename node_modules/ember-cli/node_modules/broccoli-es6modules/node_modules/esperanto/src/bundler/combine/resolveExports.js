export default function resolveExports ( bundle ) {
	let bundleExports = {};

	bundle.entryModule.exports.forEach( x => {
		if ( x.specifiers ) {
			x.specifiers.forEach( s => {
				let module;
				let name;

				if ( s.origin ) {
					module = s.origin.module;
					name = s.origin.name;
				} else {
					module = bundle.entryModule;
					name = s.name;
				}

				addExport( module, name, s.name );
			});
		}

		else if ( !x.isDefault && x.name ) {
			addExport( bundle.entryModule, x.name, x.name );
		}
	});

	function addExport ( module, name, as ) {
		if ( !bundleExports[ module.id ] ) {
			bundleExports[ module.id ] = {};
		}

		bundleExports[ module.id ][ name ] = as;
	}

	return bundleExports;
}