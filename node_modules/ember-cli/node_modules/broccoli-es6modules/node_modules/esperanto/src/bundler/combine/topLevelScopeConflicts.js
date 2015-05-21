import hasOwnProp from 'utils/hasOwnProp';
import builtins from 'utils/builtins';
import getUnscopedNames from 'utils/ast/getUnscopedNames';
import { getName } from 'utils/mappers';
import getRenamedImports from './getRenamedImports';

export default function topLevelScopeConflicts ( bundle ) {
	let conflicts = {};
	let inBundle = {};
	let importNames = bundle.externalModules.map( getName );

	bundle.modules.forEach( mod => {
		let names = builtins

			// all top defined identifiers are in top scope
			.concat( mod.ast._topLevelNames )

			// all unattributed identifiers could collide with top scope
			.concat( getUnscopedNames( mod ) )

			.concat( importNames )

			.concat( getRenamedImports( mod ) );

		if ( mod._exportsNamespace ) {
			conflicts[ mod.name ] = true;
		}

		// merge this module's top scope with bundle top scope
		names.forEach( name => {
			if ( hasOwnProp.call( inBundle, name ) ) {
				conflicts[ name ] = true;
			} else {
				inBundle[ name ] = true;
			}
		});
	});

	return conflicts;
}