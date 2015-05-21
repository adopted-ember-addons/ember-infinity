var EsperantoError = function ( message, data ) {
	var prop;

	this.message = message;
	this.stack = (new Error()).stack;

	for ( prop in data ) {
		if ( data.hasOwnProperty( prop ) ) {
			this[ prop ] = data[ prop ];
		}
	}
};

EsperantoError.prototype = new Error();
EsperantoError.prototype.constructor = EsperantoError;
EsperantoError.prototype.name = 'EsperantoError';

export default EsperantoError;