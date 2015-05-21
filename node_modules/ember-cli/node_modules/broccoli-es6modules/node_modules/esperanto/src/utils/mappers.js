export function getId ( m ) {
	return m.id;
}

export function getName ( m ) {
	return m.name;
}

export function quote ( str ) {
	return "'" + JSON.stringify(str).slice(1, -1).replace(/'/g, "\\'") + "'";
}

export function req ( path ) {
	return `require(${quote(path)})`;
}

export function globalify ( name ) {
  	if ( /^__dep\d+__$/.test( name ) ) {
		return 'undefined';
	} else {
		return `global.${name}`;
	}
}
