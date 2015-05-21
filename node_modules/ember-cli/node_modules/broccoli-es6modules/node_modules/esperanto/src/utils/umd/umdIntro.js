import { globalify, req } from 'utils/mappers';
import processName from '../amd/processName';
import processIds from '../amd/processIds';
import getImportSummary from '../amd/getImportSummary';

export default function umdIntro ({ amdName, name, hasExports, imports, absolutePaths, externalDefaults, indentStr, strict, useStrict }) {
	const useStrictPragma = useStrict ? ` 'use strict';` : '';
	let intro;

	if ( !hasExports && !imports.length ) {
		intro =
			`(function (factory) {
				!(typeof exports === 'object' && typeof module !== 'undefined') &&
				typeof define === 'function' && define.amd ? define(${processName(amdName)}factory) :
				factory()
			}(function () {${useStrictPragma}

			`;
	}

	else {
		let { ids, paths, names } = getImportSummary({ imports, name: amdName, absolutePaths });

		let amdExport, cjsExport, globalExport, defaultsBlock;

		if ( strict ) {
			cjsExport = `factory(${( hasExports ? [ 'exports' ] : [] ).concat( paths.map( req ) ).join( ', ' )})`;
			let globalDeps = ( hasExports ? [ `(global.${name} = {})` ] : [] ).concat( names.map( globalify ) ).join( ', ' );
			globalExport = `factory(${globalDeps})`;

			if ( hasExports ) {
				ids.unshift( 'exports' );
				names.unshift( 'exports' );
			}

			amdExport = `define(${processName(amdName)}${processIds(ids)}factory)`;
			defaultsBlock = '';
			if ( externalDefaults && externalDefaults.length > 0 ) {
				defaultsBlock = externalDefaults.map( x =>
					'\t' + ( x.needsNamed ? `var ${x.name}__default` : x.name ) +
						` = ('default' in ${x.name} ? ${x.name}['default'] : ${x.name});`
				).join('\n') + '\n\n';
			}
		} else {
			amdExport = `define(${processName(amdName)}${processIds(ids)}factory)`;
			cjsExport = ( hasExports ? 'module.exports = ' : '' ) + `factory(${paths.map( req ).join( ', ' )})`;
			globalExport = ( hasExports ? `global.${name} = ` : '' ) + `factory(${names.map( globalify ).join( ', ' )})`;

			defaultsBlock = '';
		}

		intro =
			`(function (global, factory) {
				typeof exports === 'object' && typeof module !== 'undefined' ? ${cjsExport} :
				typeof define === 'function' && define.amd ? ${amdExport} :
				${globalExport}
			}(this, function (${names.join( ', ' )}) {${useStrictPragma}

			${defaultsBlock}`;

	}

	return intro.replace( /^\t\t\t/gm, '' ).replace( /\t/g, indentStr );
}