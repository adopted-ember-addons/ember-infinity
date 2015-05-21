import { quote } from '../mappers';

export default function processName ( name ) {
	return name ? quote( name ) + ', ' : '';
}