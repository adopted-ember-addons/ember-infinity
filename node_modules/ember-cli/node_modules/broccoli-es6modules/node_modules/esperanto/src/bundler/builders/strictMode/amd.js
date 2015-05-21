import packageResult from '../../../utils/packageResult';
import amdIntro from '../../../utils/amd/amdIntro';
import getExportBlock from './utils/getExportBlock';

export default function amd ( bundle, options ) {
	let externalDefaults = bundle.externalModules.filter( needsDefault );
	let entry = bundle.entryModule;

	if ( externalDefaults.length ) {
		let defaultsBlock = externalDefaults.map( x => {
			// Case 1: default is used, and named is not
			if ( !x.needsNamed ) {
				return `${x.name} = ('default' in ${x.name} ? ${x.name}['default'] : ${x.name});`;
			}

			// Case 2: both default and named are used
			return `var ${x.name}__default = ('default' in ${x.name} ? ${x.name}['default'] : ${x.name});`;
		}).join( '\n' );

		bundle.body.prepend( defaultsBlock + '\n\n' );
	}

	if ( entry.defaultExport ) {
		bundle.body.append( '\n\n' + getExportBlock( entry ) );
	}

	let intro = amdIntro({
		name: options.amdName,
		imports: bundle.externalModules,
		hasExports: entry.exports.length,
		indentStr: bundle.body.getIndentString(),
		useStrict: options.useStrict !== false
	});

	bundle.body.indent().prepend( intro ).trimLines().append( '\n\n});' );
	return packageResult( bundle, bundle.body, options, 'toAmd', true );
}

function needsDefault ( externalModule ) {
	return externalModule.needsDefault;
}
