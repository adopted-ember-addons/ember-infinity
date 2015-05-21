export default function populateExternalModuleImports ( bundle ) {
	bundle.modules.forEach( mod => {
		mod.imports.forEach( x => {
			const externalModule = x.module;

			if ( !externalModule.isExternal ) {
				return;
			}

			x.specifiers.forEach( s => {
				if ( s.isDefault ) {
					externalModule.needsDefault = true;
				} else {
					externalModule.needsNamed = true;
				}
			});
		});
	});
}