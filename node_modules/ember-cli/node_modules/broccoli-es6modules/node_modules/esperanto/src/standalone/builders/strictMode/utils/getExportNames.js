export default function getExportNames ( exports ) {
	var result = {};

	exports.forEach( x => {
		if ( x.isDefault ) return;

		if ( x.hasDeclaration ) {
			result[ x.name ] = x.name;
			return;
		}

		x.specifiers.forEach( s => {
			result[ s.name ] = s.as;
		});
	});

	return result;
}
