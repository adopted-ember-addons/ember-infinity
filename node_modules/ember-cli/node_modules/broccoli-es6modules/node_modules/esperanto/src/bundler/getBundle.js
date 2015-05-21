import path from 'path';
import hasOwnProp from 'utils/hasOwnProp';
import resolveId from 'utils/resolveId';
import sortModules from './utils/sortModules';
import resolveChains from './utils/resolveChains';
import combine from './combine';
import sander from 'sander';
import getModule from './getModule';

const Promise = sander.Promise;

export default function getBundle ( options ) {
	let entry = options.entry.replace( /\.js$/, '' );
	let userModules = options.modules || {};
	let modules = [];
	let moduleLookup = {};
	let promiseByPath = {};
	let skip = options.skip;
	let names = options.names;
	let base = ( options.base ? path.resolve( options.base ) : process.cwd() ) + '/';
	let externalModules = [];
	let externalModuleLookup = {};

	if ( !entry.indexOf( base ) ) {
		entry = entry.substring( base.length );
	}

	// resolve user module paths
	options.modules && Object.keys( options.modules ).forEach( relativePath => {
		userModules[ path.resolve( base, relativePath ) ] = options.modules[ relativePath ];
	});

	let cyclicalModules = [];

	return resolvePath( base, userModules, entry, null ).then( absolutePath => {
		return fetchModule( entry, absolutePath ).then( entryModule => {
			return Promise.all( cyclicalModules ).then( () => {
				modules = sortModules( entryModule );

				let bundle = {
					entryModule,
					modules,
					externalModules,
					names
				};

				resolveChains( modules, moduleLookup );
				combine( bundle );

				return bundle;
			});

		});
	}, function ( err ) {
		if ( err.code === 'ENOENT' ) {
			throw new Error( 'Could not find entry module (' + entry + ')' );
		}

		throw err;
	});

	function fetchModule ( moduleId, absolutePath ) {
		if ( !hasOwnProp.call( promiseByPath, absolutePath ) ) {
			promiseByPath[ absolutePath ] = (
				hasOwnProp.call( userModules, absolutePath ) ?
					Promise.resolve( userModules[ absolutePath ] ) :
					sander.readFile( absolutePath ).then( String )
			).then( function ( source ) {
				let code, ast;

				// normalise
				if ( typeof source === 'object' ) {
					code = source.code;
					ast = source.ast;
				} else {
					code = source;
					ast = null;
				}

				if ( options.transform ) {
					code = options.transform( code, absolutePath );

					if ( typeof code !== 'string' && !isThenable( code ) ) {
						throw new Error( 'transform should return String or Promise' );
					}
				}

				let module = getModule({
					id: moduleId,
					path: absolutePath,
					code,
					ast,

					// TODO should not need this
					relativePath: path.relative( base, absolutePath )
				});

				modules.push( module );
				moduleLookup[ moduleId ] = module;

				let promises = module.imports.map( x => {
					// TODO remove this, use x.module instead. more flexible, no lookups involved
					const id = resolveId( x.path, module.relativePath );

					if ( id === moduleId ) {
						throw new Error( 'A module (' + moduleId + ') cannot import itself' );
					}

					// Some modules can be skipped
					if ( skip && ~skip.indexOf( id ) ) {
						const skippedModule = {
							id,
							isSkipped: true
						};

						x.module = skippedModule;
						return skippedModule;
					}

					return resolvePath( base, userModules, id, absolutePath, options.resolvePath ).then( absolutePath => {
						let promise = hasOwnProp.call( promiseByPath, absolutePath ) && promiseByPath[ absolutePath ];
						let cyclical = !!promise;

						if ( cyclical ) {
							// ensure all modules are set before we
							// create the bundle...
							cyclicalModules.push(
								promise.then( module => x.module = module )
							);

							// ...then short-circuit
							return;
						}

						return fetchModule( id, absolutePath ).then( module => x.module = module );
					}, function handleError ( err ) {
						if ( err.code === 'ENOENT' ) {
							// Most likely an external module
							let externalModule = hasOwnProp.call( externalModuleLookup, id ) && externalModuleLookup[ id ];

							if ( !externalModule ) {
								externalModule = {
									id,
									isExternal: true
								};

								externalModules.push( externalModule );
								externalModuleLookup[ id ] = externalModule;
							}

							x.module = externalModule;
						} else {
							throw err;
						}
					} );
				});

				return Promise.all( promises )
					.then( () => module );
			});
		}

		return promiseByPath[ absolutePath ];
	}
}

function resolvePath ( base, userModules, moduleId, importerPath, resolver ) {
	const noExt = moduleId.replace( /\.js$/, '' );

	return tryPath( base, noExt + '.js', userModules )
		.catch( () => tryPath( base, noExt + path.sep + 'index.js', userModules ) )
		.catch( function ( err ) {
			const resolvedPromise = resolver && Promise.resolve( resolver( moduleId, importerPath ) );

			if ( resolvedPromise ) {
				return resolvedPromise.then( resolvedPath => {
					if ( !resolvedPath ) {
						// hack but whatevs, it saves handling real ENOENTs differently
						let err = new Error();
						err.code = 'ENOENT';
						throw err;
					}

					return sander.stat( resolvedPath ).then( () => path.resolve( base, resolvedPath ) );
				});
			} else {
				throw err;
			}
		});
}

function tryPath ( base, filename, userModules ) {
	const absolutePath = path.resolve( base, filename );

	if ( hasOwnProp.call( userModules, absolutePath ) ) {
		return Promise.resolve( absolutePath );
	}
	return sander.stat( absolutePath ).then( () => absolutePath );
}

function isThenable ( obj ) {
	return obj && typeof obj.then === 'function';
}
