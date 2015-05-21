import hasOwnProp from 'utils/hasOwnProp';

export default function rewriteExportAssignments ( body, node, parent, exports, scope, capturedUpdates ) {
	let assignee;

	if ( node.type === 'AssignmentExpression' ) {
		assignee = node.left;
	} else if ( node.type === 'UpdateExpression' ) {
		assignee = node.argument;
	} else {
		return; // not an assignment
	}

	if ( assignee.type !== 'Identifier' ) {
		return;
	}

	let name = assignee.name;

	if ( scope.contains( name, true ) ) {
		return; // shadows an export
	}

	if ( exports && hasOwnProp.call( exports, name ) ) {
		let exportAs = exports[ name ];

		if ( !!capturedUpdates ) {
			capturedUpdates.push({ name, exportAs });
			return;
		}

		// special case - increment/decrement operators
		if ( node.operator === '++' || node.operator === '--' ) {
			let prefix = ``;
			let suffix = `, exports.${exportAs} = ${name}`;
			if ( parent.type !== 'ExpressionStatement' ) {
				if ( !node.prefix ) {
					suffix += `, ${name} ${node.operator === '++' ? '-' : '+'} 1`;
				}
				prefix += `( `;
				suffix += ` )`;
			}
			body.insert( node.start, prefix );
			body.insert( node.end, suffix );
		} else {
			body.insert( node.start, `exports.${exportAs} = ` );
		}
	}
}