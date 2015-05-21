import packageResult from '../../../utils/packageResult';
import transformBody from './utils/transformBody';
import amdIntro from '../../../utils/amd/amdIntro';

export default function amd ( mod, options ) {
	let intro = amdIntro({
		name: options.amdName,
		absolutePaths: options.absolutePaths,
		imports: mod.imports,
		indentStr: mod.body.getIndentString(),
		hasExports: mod.exports.length,
		useStrict: options.useStrict !== false
	});

	transformBody( mod, mod.body, {
		intro,
		outro: '\n\n});',
		_evilES3SafeReExports: options._evilES3SafeReExports
	});

	return packageResult( mod, mod.body, options, 'toAmd' );
}
