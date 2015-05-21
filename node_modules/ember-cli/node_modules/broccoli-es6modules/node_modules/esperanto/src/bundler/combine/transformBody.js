import hasOwnProp from 'utils/hasOwnProp';
import getReadOnlyIdentifiers from 'utils/getReadOnlyIdentifiers';
import traverseAst from 'utils/ast/traverse';

export default function transformBody ( bundle, mod, body ) {
	let identifierReplacements = mod.identifierReplacements;
	let [ importedBindings, importedNamespaces ] = getReadOnlyIdentifiers( mod.imports );

	let exportNames = hasOwnProp.call( bundle.exports, mod.id ) && bundle.exports[ mod.id ];

	traverseAst( mod.ast, body, identifierReplacements, importedBindings, importedNamespaces, exportNames );

	// Remove import statements
	mod.imports.forEach( x => {
		if ( !x.passthrough ) {
			body.remove( x.start, x.next );
		}
	});

	let shouldExportEarly = {};

	// Remove export statements
	mod.exports.forEach( x => {
		var name;

		if ( x.isDefault ) {
			if ( x.type === 'namedFunction' || x.type === 'namedClass' ) {
				// if you have a default export like
				//
				//     export default function foo () {...}
				//
				// you need to rewrite it as
				//
				//     function foo () {...}
				//     exports.default = foo;
				//
				// as the `foo` reference may be used elsewhere

				// remove the `export default `, keep the rest
				body.remove( x.start, x.valueStart );
			}

			else if ( x.node.declaration && ( name = x.node.declaration.name ) ) {
				if ( name === identifierReplacements.default ) {
					body.remove( x.start, x.end );
				} else {
					let original = hasOwnProp.call( identifierReplacements, name ) ? identifierReplacements[ name ] : name;
					body.replace( x.start, x.end, `var ${identifierReplacements.default} = ${original};` );
				}
			}

			else {
				body.replace( x.start, x.valueStart, `var ${identifierReplacements.default} = ` );
			}

			return;
		}

		if ( x.hasDeclaration ) {
			if ( x.type === 'namedFunction' ) {
				shouldExportEarly[ x.name ] = true; // TODO what about `function foo () {}; export { foo }`?
			}

			body.remove( x.start, x.valueStart );
		} else {
			body.remove( x.start, x.next );
		}
	});

	// If this module exports a namespace - i.e. another module does
	// `import * from 'foo'` - then we need to make all this module's
	// exports available, using Object.defineProperty
	var indentStr = body.getIndentString();
	if ( mod._exportsNamespace ) {
		let namespaceExportBlock = `var ${mod.name} = {\n`,
			namespaceExports = [];

		mod.exports.forEach( x => {
			if ( x.hasDeclaration ) {
				namespaceExports.push( indentStr + `get ${x.name} () { return ${identifierReplacements[x.name]}; }` );
			}

			else if ( x.isDefault ) {
				namespaceExports.push( indentStr + `get default () { return ${identifierReplacements.default}; }` );
			}

			else {
				x.specifiers.forEach( s => {
					namespaceExports.push( indentStr + `get ${s.name} () { return ${s.name}; }` );
				});
			}
		});

		namespaceExportBlock += namespaceExports.join( ',\n' ) + '\n};\n\n';

		body.prepend( namespaceExportBlock );
	}

	// If this module is responsible for one of the bundle's exports
	// (it doesn't have to be the entry module, which could re-export
	// a binding from another module), we write exports here
	if ( exportNames ) {
		let exportBlock = [];

		Object.keys( exportNames ).forEach( name => {
			var exportAs = exportNames[ name ];
			exportBlock.push( `exports.${exportAs} = ${identifierReplacements[name]};` );
		});

		if ( exportBlock.length ) {
			body.trim().append( '\n\n' + exportBlock.join( '\n' ) );
		}
	}

	return body.trim();
}
