/*
	This module traverse a module's AST, attaching scope information
	to nodes as it goes, which is later used to determine which
	identifiers need to be rewritten to avoid collisions
*/

import walk from './walk';
import { getName } from '../mappers';

function Scope ( options ) {
	options = options || {};

	this.parent = options.parent;
	this.names = options.params || [];
}

Scope.prototype = {
	add: function ( name ) {
		this.names.push( name );
	},

	contains: function ( name, ignoreTopLevel ) {
		if ( ignoreTopLevel && !this.parent ) {
			return false;
		}

		if ( ~this.names.indexOf( name ) ) {
			return true;
		}

		if ( this.parent ) {
			return this.parent.contains( name, ignoreTopLevel );
		}

		return false;
	}
};

export default function annotateAst ( ast ) {
	let scope = new Scope();
	let blockScope = new Scope();
	let declared = {};
	let topLevelFunctionNames = [];
	let templateLiteralRanges = [];

	let envDepth = 0;

	walk( ast, {
		enter ( node ) {
			if ( node.type === 'ImportDeclaration' || node.type === 'ExportSpecifier' ) {
				node._skip = true;
			}

			if ( node._skip ) {
				return this.skip();
			}

			switch ( node.type ) {
				case 'FunctionExpression':
				case 'FunctionDeclaration':

					envDepth += 1;

					// fallthrough

				case 'ArrowFunctionExpression':
					if ( node.id ) {
						addToScope( node );

						// If this is the root scope, this may need to be
						// exported early, so we make a note of it
						if ( !scope.parent && node.type === 'FunctionDeclaration' ) {
							topLevelFunctionNames.push( node.id.name );
						}
					}

					let names = node.params.map( getName );

					names.forEach( name => declared[ name ] = true );

					scope = node._scope = new Scope({
						parent: scope,
						params: names // TODO rest params?
					});

					break;

				case 'BlockStatement':
					blockScope = node._blockScope = new Scope({
						parent: blockScope
					});

					break;

				case 'VariableDeclaration':
					node.declarations.forEach( node.kind === 'let' ? addToBlockScope : addToScope );
					break;

				case 'ClassExpression':
				case 'ClassDeclaration':
					addToScope( node );
					break;

				case 'MemberExpression':
					if ( envDepth === 0 && node.object.type === 'ThisExpression' ) {
						throw new Error('`this` at the top level is undefined');
					}
					!node.computed && ( node.property._skip = true );
					break;

				case 'Property':
					node.key._skip = true;
					break;

				case 'TemplateLiteral':
					templateLiteralRanges.push([ node.start, node.end ]);
					break;

				case 'ThisExpression':
					if (envDepth === 0) {
						node._topLevel = true;
					}
					break;
			}
		},
		leave ( node ) {
			switch ( node.type ) {
				case 'FunctionExpression':
				case 'FunctionDeclaration':

					envDepth -= 1;

					// fallthrough

				case 'ArrowFunctionExpression':

					scope = scope.parent;

					break;

				case 'BlockStatement':
					blockScope = blockScope.parent;
					break;
			}
		}
	});

	function addToScope ( declarator ) {
		var name = declarator.id.name;

		scope.add( name );
		declared[ name ] = true;
	}

	function addToBlockScope ( declarator ) {
		var name = declarator.id.name;

		blockScope.add( name );
		declared[ name ] = true;
	}

	ast._scope = scope;
	ast._blockScope = blockScope;
	ast._topLevelNames = ast._scope.names.concat( ast._blockScope.names );
	ast._topLevelFunctionNames = topLevelFunctionNames;
	ast._declared = declared;
	ast._templateLiteralRanges = templateLiteralRanges;
}
