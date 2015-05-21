export default function hasNamedImports ( mod ) {
	var i = mod.imports.length;

	while ( i-- ) {
		if ( mod.imports[i].isNamed ) {
			return true;
		}
	}
}
