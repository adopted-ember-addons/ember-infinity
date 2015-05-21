import walk from './walk';
import disallowIllegalReassignment from './disallowIllegalReassignment';
import replaceIdentifiers from './replaceIdentifiers';
import rewriteExportAssignments from './rewriteExportAssignments';

export default function traverseAst ( ast, body, identifierReplacements, importedBindings, importedNamespaces, exportNames ) {
	let scope = ast._scope;
	let blockScope = ast._blockScope;
	let capturedUpdates = null;
	let previousCapturedUpdates = null;

	walk( ast, {
		enter ( node, parent ) {
			// we're only interested in references, not property names etc
			if ( node._skip ) return this.skip();

			if ( node._scope ) {
				scope = node._scope;
			} else if ( node._blockScope ) {
				blockScope = node._blockScope;
			}

			// Special case: if you have a variable declaration that updates existing
			// bindings as a side-effect, e.g. `var a = b++`, where `b` is an exported
			// value, we can't simply append `exports.b = b` to the update (as we
			// normally would) because that would be syntactically invalid. Instead,
			// we capture the change and update the export (and any others) after the
			// variable declaration
			if ( node.type === 'VariableDeclaration' ) {
				previousCapturedUpdates = capturedUpdates;
				capturedUpdates = [];
				return;
			}

			disallowIllegalReassignment( node, importedBindings, importedNamespaces, scope );

			// Rewrite assignments to exports inside functions, to keep bindings live.
			// This call may mutate `capturedUpdates`, which is used elsewhere
			if ( scope !== ast._scope ) {
				rewriteExportAssignments( body, node, parent, exportNames, scope, capturedUpdates );
			}

			if ( node.type === 'Identifier' && parent.type !== 'FunctionExpression' ) {
				replaceIdentifiers( body, node, identifierReplacements, scope );
			}

			// Replace top-level this with undefined ES6 8.1.1.5.4
			if ( node.type === 'ThisExpression' && node._topLevel ) {
				body.replace( node.start, node.end, 'undefined' );
			}
		},

		leave ( node ) {
			// Special case - see above
			if ( node.type === 'VariableDeclaration' ) {
				if ( capturedUpdates.length ) {
					body.insert( node.end, capturedUpdates.map( exportCapturedUpdate ).join( '' ) );
				}

				capturedUpdates = previousCapturedUpdates;
			}

			if ( node._scope ) {
				scope = scope.parent;
			} else if ( node._blockScope ) {
				blockScope = blockScope.parent;
			}
		}
	});
}

function exportCapturedUpdate ( c ) {
	return ` exports.${c.exportAs} = ${c.name};`;
}
