import transformExportDeclaration from './utils/transformExportDeclaration';
import packageResult from 'utils/packageResult';
import amdIntro from '../../../utils/amd/amdIntro';

export default function amd ( mod, options ) {
	mod.imports.forEach( x => {
		mod.body.remove( x.start, x.next );
	});

	transformExportDeclaration( mod.exports[0], mod.body );

	let intro = amdIntro({
		name: options.amdName,
		imports: mod.imports,
		absolutePaths: options.absolutePaths,
		indentStr: mod.body.getIndentString(),
		useStrict: options.useStrict !== false
	});

	mod.body.trim()
		.indent()
		.prepend( intro )
		.trim()
		.append( '\n\n});' );

	return packageResult( mod, mod.body, options, 'toAmd' );
}
