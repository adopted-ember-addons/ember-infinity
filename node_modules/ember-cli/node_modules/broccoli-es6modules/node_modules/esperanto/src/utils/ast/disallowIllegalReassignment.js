import hasOwnProp from 'utils/hasOwnProp';

var bindingMessage = 'Cannot reassign imported binding ',
	namespaceMessage = 'Cannot reassign imported binding of namespace ';

export default function disallowIllegalReassignment ( node, importedBindings, importedNamespaces, scope ) {
	let assignee, isNamespaceAssignment;

	if ( node.type === 'AssignmentExpression' ) {
		assignee = node.left;
	} else if ( node.type === 'UpdateExpression' ) {
		assignee = node.argument;
	} else {
		return; // not an assignment
	}

	if ( assignee.type === 'MemberExpression' ) {
		assignee = assignee.object;
		isNamespaceAssignment = true;
	}

	if ( assignee.type !== 'Identifier' ) {
		return; // not assigning to a binding
	}

	let name = assignee.name;

	if ( hasOwnProp.call( isNamespaceAssignment ? importedNamespaces : importedBindings, name ) && !scope.contains( name ) ) {
		throw new Error( ( isNamespaceAssignment ? namespaceMessage : bindingMessage ) + '`' + name + '`' );
	}
}
