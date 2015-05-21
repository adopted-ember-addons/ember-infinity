import umdIntro from 'utils/umd/umdIntro';
import requireName from 'utils/umd/requireName';
import packageResult from 'utils/packageResult';
import getExportBlock from './utils/getExportBlock';

export default function umd ( bundle, options ) {
	requireName( options );

	let entry = bundle.entryModule;

	let intro = umdIntro({
		hasExports: entry.exports.length > 0,
		imports: bundle.externalModules,
		externalDefaults: bundle.externalModules.filter( needsDefault ),
		amdName: options.amdName,
		name: options.name,
		indentStr: bundle.body.getIndentString(),
		strict: true,
		useStrict: options.useStrict !== false
	});

	if ( entry.defaultExport ) {
		bundle.body.append( '\n\n' + getExportBlock( entry ) );
	}

	bundle.body.indent().prepend( intro ).trimLines().append('\n\n}));');

	return packageResult( bundle, bundle.body, options, 'toUmd', true );
}

function needsDefault ( externalModule ) {
	return externalModule.needsDefault;
}
