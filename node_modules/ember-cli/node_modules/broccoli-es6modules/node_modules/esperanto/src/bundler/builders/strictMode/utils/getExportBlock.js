export default function getExportBlock ( entry ) {
	let name = entry.identifierReplacements.default;
	return `exports['default'] = ${name};`;
}
