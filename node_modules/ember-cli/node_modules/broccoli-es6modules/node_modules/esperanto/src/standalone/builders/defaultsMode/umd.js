import transformExportDeclaration from './utils/transformExportDeclaration';
import packageResult from 'utils/packageResult';
import umdIntro from 'utils/umd/umdIntro';
import requireName from 'utils/umd/requireName';

export default function umd ( mod, options ) {
	requireName( options );

	mod.imports.forEach( x => {
		mod.body.remove( x.start, x.next );
	});

	let intro = umdIntro({
		hasExports: mod.exports.length > 0,
		imports: mod.imports,
		amdName: options.amdName,
		absolutePaths: options.absolutePaths,
		name: options.name,
		indentStr: mod.body.getIndentString(),
		useStrict: options.useStrict !== false
	});

	transformExportDeclaration( mod.exports[0], mod.body );

	mod.body.indent().prepend( intro ).trimLines().append( '\n\n}));' );

	return packageResult( mod, mod.body, options, 'toUmd' );
}
