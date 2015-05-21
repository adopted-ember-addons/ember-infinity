import { quote } from '../mappers';

export default function processIds ( ids ) {
	return ids.length ? '[' + ids.map( quote ).join( ', ' ) + '], ' : '';
}