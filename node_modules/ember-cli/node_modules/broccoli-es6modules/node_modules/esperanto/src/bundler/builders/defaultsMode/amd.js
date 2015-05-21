import packageResult from '../../../utils/packageResult';
import amdIntro from '../../../utils/amd/amdIntro';

export default function amd ( bundle, options ) {
	let defaultName = bundle.entryModule.identifierReplacements.default;
	if ( defaultName ) {
		bundle.body.append( `\n\nreturn ${defaultName};` );
	}

	let intro = amdIntro({
		name: options.amdName,
		imports: bundle.externalModules,
		indentStr: bundle.body.getIndentString(),
		useStrict: options.useStrict !== false
	});

	bundle.body.indent().prepend( intro ).trimLines().append( '\n\n});' );
	return packageResult( bundle, bundle.body, options, 'toAmd', true );
}