export default function json(status, payload) {
  return [
    status,
    { 'Content-Type' : 'text/json' },
    JSON.stringify(payload)
  ];
}
