import hasOwnProp from 'utils/hasOwnProp';
import builtins from 'utils/builtins';
import { default as sanitize, splitPath } from 'utils/sanitize';

export default function getUniqueNames ( bundle ) {
	let { modules, externalModules } = bundle;
	let userNames = bundle.names;
	let names = {};

	let used = modules.reduce( ( declared, mod ) => {
		Object.keys( mod.ast._declared ).forEach( x => declared[x] = true );
		return declared;
	}, {} );

	// copy builtins
	builtins.forEach( n => used[n] = true );

	// copy user-specified names
	if ( userNames ) {
		Object.keys( userNames ).forEach( id => {
			names[ id ] = userNames[ id ];
			used[ userNames[ id ] ] = true;
		});
	}

	// infer names from default imports - e.g. with `import _ from './utils'`,
	// use '_' instead of generating a name from 'utils'
	function inferName ( x ) {
		if ( x.isDefault && !hasOwnProp.call( names, x.module.id ) && !hasOwnProp.call( used, x.as ) ) {
			names[ x.module.id ] = x.as;
			used[ x.as ] = true;
		}
	}
	modules.forEach( mod => {
		mod.imports.forEach( inferName );
	});

	// for the rest, make names as compact as possible without
	// introducing conflicts
	modules.concat( externalModules ).forEach( mod => {
		// is this already named?
		if ( hasOwnProp.call( names, mod.id ) ) {
			mod.name = names[ mod.id ];
			return;
		}

		let name;
		let parts = splitPath( mod.id );
		let i = parts.length;

		while ( i-- ) {
			name = sanitize( parts.slice( i ).join( '_' ) );

			if ( !hasOwnProp.call( used, name ) ) {
				break;
			}
		}

		while ( hasOwnProp.call( used, name ) ) {
			name = '_' + name;
		}

		used[ name ] = true;
		mod.name = name;
	});

	return names;
}
