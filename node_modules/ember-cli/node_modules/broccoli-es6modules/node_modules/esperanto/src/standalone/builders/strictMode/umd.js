import packageResult from 'utils/packageResult';
import umdIntro from 'utils/umd/umdIntro';
import requireName from 'utils/umd/requireName';
import transformBody from './utils/transformBody';

export default function umd ( mod, options ) {
	requireName( options );

	let intro = umdIntro({
		hasExports: mod.exports.length > 0,
		imports: mod.imports,
		amdName: options.amdName,
		absolutePaths: options.absolutePaths,
		name: options.name,
		indentStr: mod.body.getIndentString(),
		strict: true,
		useStrict: options.useStrict !== false
	});

	transformBody( mod, mod.body, {
		intro: intro,
		outro: '\n\n}));',
		_evilES3SafeReExports: options._evilES3SafeReExports
	});

	return packageResult( mod, mod.body, options, 'toUmd' );
}
