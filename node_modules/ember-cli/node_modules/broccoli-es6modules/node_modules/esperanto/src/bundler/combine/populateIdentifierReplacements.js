import hasOwnProp from 'utils/hasOwnProp';
import topLevelScopeConflicts from './topLevelScopeConflicts';

/**
 * Figures out which identifiers need to be rewritten within
   a bundle to avoid conflicts
 * @param {object} bundle - the bundle
 * @returns {object}
 */
export default function populateIdentifierReplacements ( bundle ) {
	// first, discover conflicts
	let conflicts = topLevelScopeConflicts( bundle );

	// then figure out what identifiers need to be created
	// for default exports
	bundle.modules.forEach( mod => {
		let x = mod.defaultExport;

		if ( x ) {
			let result;

			if ( x.hasDeclaration && x.name ) {
				result = hasOwnProp.call( conflicts, x.name ) || otherModulesDeclare( mod, x.name ) ?
					`${mod.name}__${x.name}` :
					x.name;
			} else {
				result = hasOwnProp.call( conflicts, mod.name ) || ( x.value !== mod.name && ~mod.ast._topLevelNames.indexOf( mod.name )) || otherModulesDeclare( mod, mod.name ) ?
					`${mod.name}__default` :
					mod.name;
			}

			mod.identifierReplacements.default = result;
		}
	});

	// then determine which existing identifiers
	// need to be replaced
	bundle.modules.forEach( mod => {
		let moduleIdentifiers = mod.identifierReplacements;

		mod.ast._topLevelNames.forEach( n => {
			moduleIdentifiers[n] = hasOwnProp.call( conflicts, n ) ?
				`${mod.name}__${n}` :
				n;
		});

		mod.imports.forEach( x => {
			if ( x.passthrough ) {
				return;
			}

			const imported = x.module;

			x.specifiers.forEach( s => {
				let replacement;

				if ( s.isBatch ) {
					replacement = x.module.name;
				}

				else {
					let mod;
					let specifierName;

					if ( s.origin ) {
						// chained bindings
						mod = s.origin.module;
						specifierName = s.origin.name;
					} else {
						mod = imported;
						specifierName = s.name;
					}

					const moduleName = mod && mod.name;

					if ( specifierName === 'default' ) {
						// if it's an external module, always use __default if the
						// bundle also uses named imports
						if ( imported.isExternal ) {
							replacement = imported.needsNamed ? `${moduleName}__default` : moduleName;
						}

						// TODO We currently need to check for the existence of `mod`, because modules
						// can be skipped. Would be better to replace skipped modules with dummies
						// - see https://github.com/Rich-Harris/esperanto/issues/32
						else if ( mod && !mod.isSkipped ) {
							replacement = mod.identifierReplacements.default;
						}
					} else if ( !imported.isExternal ) {
						replacement = hasOwnProp.call( conflicts, specifierName ) ?
							`${moduleName}__${specifierName}` :
							specifierName;
					} else {
						replacement = moduleName + '.' + specifierName;
					}
				}

				if ( replacement !== s.as ) {
					moduleIdentifiers[ s.as ] = replacement;
				}
			});
		});
	});

	function otherModulesDeclare ( mod, replacement ) {
		var i, otherMod;

		i = bundle.modules.length;
		while ( i-- ) {
			otherMod = bundle.modules[i];

			if ( mod === otherMod ) {
				continue;
			}

			if ( hasOwnProp.call( otherMod.ast._declared, replacement ) ) {
				return true;
			}
		}
	}
}
