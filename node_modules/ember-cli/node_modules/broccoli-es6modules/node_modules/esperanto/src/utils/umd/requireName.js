import EsperantoError from 'utils/EsperantoError';

export default function requireName ( options ) {
	if ( !options.name ) {
		throw new EsperantoError( 'You must supply a `name` option for UMD modules', {
			code: 'MISSING_NAME'
		});
	}
}