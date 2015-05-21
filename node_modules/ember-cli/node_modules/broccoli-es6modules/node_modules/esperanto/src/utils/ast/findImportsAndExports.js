/**
 * Inspects a module and discovers/categorises import & export declarations
 * @param {object} mod - the module object
 * @param {string} source - the module's original source code
 * @param {object} ast - the result of parsing `source` with acorn
 * @returns {array} - [ imports, exports ]
 */
export default function findImportsAndExports ( mod, source, ast ) {
	var imports = [], exports = [], previousDeclaration;

	ast.body.forEach( node => {
		var passthrough, declaration;

		if ( previousDeclaration ) {
			previousDeclaration.next = node.start;

			if ( node.type !== 'EmptyStatement' ) {
				previousDeclaration = null;
			}
		}

		if ( node.type === 'ImportDeclaration' ) {
			declaration = processImport( node );
			imports.push( declaration );
		}

		else if ( node.type === 'ExportDefaultDeclaration' ) {
			declaration = processDefaultExport( node, source );
			exports.push( declaration );

			if ( mod.defaultExport ) {
				throw new Error( 'Duplicate default exports' );
			}
			mod.defaultExport = declaration;
		}

		else if ( node.type === 'ExportNamedDeclaration' ) {
			declaration = processExport( node, source );
			exports.push( declaration );

			if ( node.source ) {
				// it's both an import and an export, e.g.
				// `export { foo } from './bar';
				passthrough = processImport( node, true );
				imports.push( passthrough );

				declaration.passthrough = passthrough;
			}
		}

		if ( declaration ) {
			previousDeclaration = declaration;
		}
	});

	// catch any trailing semicolons
	if ( previousDeclaration ) {
		previousDeclaration.next = source.length;
		previousDeclaration.isFinal = true;
	}

	return [ imports, exports ];
}

/**
 * Generates a representation of an import declaration
 * @param {object} node - the original AST node
 * @param {boolean} passthrough - `true` if this is an `export { foo } from 'bar'`-style declaration
 * @returns {object}
 */
function processImport ( node, passthrough ) {
	var x = {
		module: null, // used by bundler - filled in later
		node: node,
		start: node.start,
		end: node.end,
		passthrough: !!passthrough,

		path: node.source.value,
		specifiers: node.specifiers.map( s => {
			if ( s.type === 'ImportNamespaceSpecifier' ) {
				return {
					isBatch: true,
					name: s.local.name, // TODO is this line necessary?
					as: s.local.name
				};
			}

			if ( s.type === 'ImportDefaultSpecifier' ) {
				return {
					isDefault: true,
					name: 'default',
					as: s.local.name
				};
			}

			return {
				name: ( !!passthrough ? s.exported : s.imported ).name,
				as: s.local.name
			};
		})
	};

	// TODO have different types of imports - batch, default, named
	if ( x.specifiers.length === 0 ) {
		x.isEmpty = true;
	} else if ( x.specifiers.length === 1 && x.specifiers[0].isDefault ) {
		x.isDefault = true;
		x.as = x.specifiers[0].as;

	} else if ( x.specifiers.length === 1 && x.specifiers[0].isBatch ) {
		x.isBatch = true;
		x.as = x.specifiers[0].name;
	} else {
		x.isNamed = true;
	}

	return x;
}

function processDefaultExport ( node, source ) {
	let result = {
		isDefault: true,
		node: node,
		start: node.start,
		end: node.end
	};

	let d = node.declaration;

	if ( d.type === 'FunctionExpression' ) {
		// Case 1: `export default function () {...}`
		result.hasDeclaration = true; // TODO remove in favour of result.type
		result.type = 'anonFunction';
	}

	else if ( d.type === 'FunctionDeclaration' ) {
		// Case 2: `export default function foo () {...}`
		result.hasDeclaration = true; // TODO remove in favour of result.type
		result.type = 'namedFunction';
		result.name = d.id.name;
	}

	else if ( d.type === 'ClassExpression' ) {
		// Case 3: `export default class {...}`
		result.hasDeclaration = true; // TODO remove in favour of result.type
		result.type = 'anonClass';
	}

	else if ( d.type === 'ClassDeclaration' ) {
		// Case 4: `export default class Foo {...}`
		result.hasDeclaration = true; // TODO remove in favour of result.type
		result.type = 'namedClass';
		result.name = d.id.name;
	}

	else {
		result.type = 'expression';
		result.name = 'default';
	}

	result.value = source.slice( d.start, d.end );
	result.valueStart = d.start;

	return result;
}

/**
 * Generates a representation of an export declaration
 * @param {object} node - the original AST node
 * @param {string} source - the original source code
 * @returns {object}
 */
function processExport ( node, source ) {
	var result, d;

	result = {
		node: node,
		start: node.start,
		end: node.end
	};

	if ( d = node.declaration ) {
		result.value = source.slice( d.start, d.end );
		result.valueStart = d.start;

		// Case 1: `export var foo = 'bar'`
		if ( d.type === 'VariableDeclaration' ) {
			result.hasDeclaration = true; // TODO remove in favour of result.type
			result.type = 'varDeclaration';
			result.name = d.declarations[0].id.name;
		}

		// Case 2: `export function foo () {...}`
		else if ( d.type === 'FunctionDeclaration' ) {
			result.hasDeclaration = true; // TODO remove in favour of result.type
			result.type = 'namedFunction';
			result.name = d.id.name;
		}

		// Case 3: `export class Foo {...}`
		else if ( d.type === 'ClassDeclaration' ) {
			result.hasDeclaration = true; // TODO remove in favour of result.type
			result.type = 'namedClass';
			result.name = d.id.name;
		}
	}

	// Case 9: `export { foo, bar };`
	else {
		result.type = 'named';
		result.specifiers = node.specifiers.map( s => {
			return {
				name: s.local.name,
				as: s.exported.name
			};
		});
	}

	return result;
}
