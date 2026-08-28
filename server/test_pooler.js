const { Client } = require('pg');

const ref = 'bmrkjcxffduqdjonxvqg';
const password = 'Igofamily1234@';
const regions = [
  'ap-south-1', 'ap-southeast-1', 'ap-northeast-1', 'us-east-1', 'us-west-1',
  'eu-west-1', 'eu-central-1', 'sa-east-1', 'ap-east-1', 'ap-southeast-2'
];

async function tryConn(host, port) {
  const client = new Client({
    host, port,
    database: 'postgres',
    user: `postgres.${ref}`,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    console.log(`SUCCESS: ${host}:${port}`);
    await client.end();
    return true;
  } catch (e) {
    console.log(`fail ${host}:${port} -> ${e.message}`);
    try { await client.end(); } catch {}
    return false;
  }
}

(async () => {
  for (const region of regions) {
    for (const pfx of ['aws-0', 'aws-1']) {
      const host = `${pfx}-${region}.pooler.supabase.com`;
      const ok = await tryConn(host, 6543);
      if (ok) process.exit(0);
    }
  }
  console.log('NONE WORKED');
})();
