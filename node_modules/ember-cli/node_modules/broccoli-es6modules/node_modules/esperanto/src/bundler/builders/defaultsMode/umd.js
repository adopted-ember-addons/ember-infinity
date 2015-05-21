import packageResult from 'utils/packageResult';
import umdIntro from 'utils/umd/umdIntro';
import requireName from 'utils/umd/requireName';

export default function umd ( bundle, options ) {
	requireName( options );

	let entry = bundle.entryModule;

	let intro = umdIntro({
		hasExports: entry.exports.length > 0,
		imports: bundle.externalModules,
		amdName: options.amdName,
		name: options.name,
		indentStr: bundle.body.getIndentString(),
		useStrict: options.useStrict !== false
	});

	if ( entry.defaultExport ) {
		bundle.body.append( `\n\nreturn ${entry.identifierReplacements.default};` );
	}

	bundle.body.indent().prepend( intro ).trimLines().append('\n\n}));');

	return packageResult( bundle, bundle.body, options, 'toUmd', true );
}
