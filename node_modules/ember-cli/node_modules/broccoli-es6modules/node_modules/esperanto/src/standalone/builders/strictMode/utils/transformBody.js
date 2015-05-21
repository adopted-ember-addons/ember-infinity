import gatherImports from './gatherImports';
import getExportNames from './getExportNames';
import getReadOnlyIdentifiers from 'utils/getReadOnlyIdentifiers';
import traverseAst from 'utils/ast/traverse';
import hasOwnProp from 'utils/hasOwnProp';

export default function transformBody ( mod, body, options ) {
	let [ chains, identifierReplacements ] = gatherImports( mod.imports );
	let exportNames = getExportNames( mod.exports );

	let [ importedBindings, importedNamespaces ] = getReadOnlyIdentifiers( mod.imports );

	// ensure no conflict with `exports`
	identifierReplacements.exports = deconflict( 'exports', mod.ast._declared );

	traverseAst( mod.ast, body, identifierReplacements, importedBindings, importedNamespaces, exportNames );

	// Remove import statements from the body of the module
	mod.imports.forEach( x => {
		body.remove( x.start, x.next );
	});

	// Prepend require() statements (CommonJS output only)
	if ( options.header ) {
		body.prepend( options.header + '\n\n' );
	}

	// Remove export statements (but keep declarations)
	mod.exports.forEach( x => {
		if ( x.isDefault ) {
			if ( /^named/.test( x.type ) ) {
				// export default function answer () { return 42; }
				body.remove( x.start, x.valueStart );
				body.insert( x.end, `\nexports['default'] = ${x.name};` );
			} else {
				// everything else
				body.replace( x.start, x.valueStart, 'exports[\'default\'] = ' );
			}
		}

		else {
			switch ( x.type ) {
				case 'varDeclaration': // export var answer = 42; (or let)
				case 'namedFunction':  // export function answer () {...}
				case 'namedClass':     // export class answer {...}
					body.remove( x.start, x.valueStart );
					break;

				case 'named':          // export { foo, bar };
					body.remove( x.start, x.next );
					break;

				default:
					body.replace( x.start, x.valueStart, 'exports[\'default\'] = ' );
			}
		}
	});

	// Append export block (this is the same for all module types, unlike imports)
	let earlyExports = [];
	let lateExports = [];

	Object.keys( exportNames ).forEach( name => {
		var exportAs = exportNames[ name ];

		if ( chains.hasOwnProperty( name ) ) {
			// special case - a binding from another module
			if ( !options._evilES3SafeReExports ) {
				earlyExports.push( `Object.defineProperty(exports, '${exportAs}', { enumerable: true, get: function () { return ${chains[name]}; }});` );
			} else {
				lateExports.push( `exports.${exportAs} = ${chains[name]};` );
			}
		} else if ( ~mod.ast._topLevelFunctionNames.indexOf( name ) ) {
			// functions should be exported early, in
			// case of cyclic dependencies
			earlyExports.push( `exports.${exportAs} = ${name};` );
		} else {
			lateExports.push( `exports.${exportAs} = ${name};` );
		}
	});

	// Function exports should be exported immediately after 'use strict'
	if ( earlyExports.length ) {
		body.trim().prepend( earlyExports.join( '\n' ) + '\n\n' );
	}

	// Everything else should be exported at the end
	if ( lateExports.length ) {
		body.trim().append( '\n\n' + lateExports.join( '\n' ) );
	}

	if ( options.intro && options.outro ) {
		body.indent().prepend( options.intro ).trimLines().append( options.outro );
	}
}

function deconflict ( name, declared ) {
	while ( hasOwnProp.call( declared, name ) ) {
		name = '_' + name;
	}

	return name;
}
