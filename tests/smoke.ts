const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  const data = await res.json();
  if (data?.status !== 'ok') throw new Error(`Invalid health response: ${JSON.stringify(data)}`);
  console.log('Health check OK');

  const subs = await fetch(`${BASE}/subscriptions`);
  if (!subs.ok) throw new Error(`Subscriptions failed: ${subs.status} ${await subs.text()}`);
  const list = await subs.json();
  if (!Array.isArray(list)) throw new Error(`Invalid subscriptions response`);
  console.log('Subscriptions OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
