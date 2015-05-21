import hasOwnProp from 'utils/hasOwnProp';
import walk from 'utils/ast/walk';

export default function sortModules ( entry ) {
	let seen = {};
	let ordered = [];
	let hasCycles;

	let strongDeps = {};
	let stronglyDependsOn = {};

	function visit ( mod ) {
		const { id } = mod;

		seen[ id ] = true;

		strongDeps[ id ] = [];
		stronglyDependsOn[ id ] = {};

		mod.imports.forEach( x => {
			const imported = x.module;

			if ( imported.isExternal || imported.isSkipped ) return;

			// if `mod` references a binding from `imported` at the top
			// level (i.e. outside function bodies), we say that `mod`
			// strongly depends on `imported. If two modules depend on
			// each other, this helps us order them such that if a
			// strongly depends on b, and b weakly depends on a, b
			// goes first
			if ( referencesAtTopLevel( mod, imported ) ) {
				strongDeps[ id ].push( imported );
			}

			if ( hasOwnProp.call( seen, imported.id ) ) {
				// we need to prevent an infinite loop, and note that
				// we need to check for strong/weak dependency relationships
				hasCycles = true;
				return;
			}

			visit( imported );
		});

		// add second (and third...) order dependencies
		function addStrongDependencies ( dependency ) {
			if ( hasOwnProp.call( stronglyDependsOn[ id ], dependency.id ) ) return;

			stronglyDependsOn[ id ][ dependency.id ] = true;
			strongDeps[ dependency.id ].forEach( addStrongDependencies );
		}

		strongDeps[ id ].forEach( addStrongDependencies );

		ordered.push( mod );
	}

	visit( entry );

	let unordered;

	if ( hasCycles ) {
		unordered = ordered;
		ordered = [];

		// unordered is actually semi-ordered, as [ fewer dependencies ... more dependencies ]
		unordered.forEach( x => {
			// ensure strong dependencies of x that don't strongly depend on x go first
			strongDeps[ x.id ].forEach( place );

			function place ( dep ) {
				if ( !stronglyDependsOn[ dep.id ][ x.id ] && !~ordered.indexOf( dep ) ) {
					strongDeps[ dep.id ].forEach( place );
					ordered.push( dep );
				}
			}

			if ( !~ordered.indexOf( x ) ) {
				ordered.push( x );
			}
		});
	}

	return ordered;
}

function referencesAtTopLevel ( a, b ) {
	let bindings = [];

	// find out which bindings a imports from b
	let i = a.imports.length;
	while ( i-- ) {
		if ( a.imports[i].module === b ) {
			bindings.push.apply( bindings, a.imports[i].specifiers.map( x => x.as ) );
		}
	}

	// see if any of those bindings are referenced at the top level
	let referencedAtTopLevel = false;

	walk( a.ast, {
		enter ( node ) {
			if ( /^Import/.test( node.type ) || ( node._scope && node._scope.parent ) ) {
				return this.skip();
			}

			if ( node.type === 'Identifier' && ~bindings.indexOf( node.name ) ) {
				referencedAtTopLevel = true;
				this.abort();
			}
		}
	});

	return referencedAtTopLevel;
}