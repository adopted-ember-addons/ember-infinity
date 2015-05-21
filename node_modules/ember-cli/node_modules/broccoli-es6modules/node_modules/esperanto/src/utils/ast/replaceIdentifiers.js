import hasOwnProp from 'utils/hasOwnProp';

export default function replaceIdentifiers ( body, node, identifierReplacements, scope ) {
	let name = node.name;
	let replacement = hasOwnProp.call( identifierReplacements, name ) && identifierReplacements[ name ];

	// TODO unchanged identifiers shouldn't have got this far -
	// remove the `replacement !== name` safeguard once that's the case
	if ( replacement && replacement !== name && !scope.contains( name, true ) ) {
		// rewrite
		body.replace( node.start, node.end, replacement );
	}
}
