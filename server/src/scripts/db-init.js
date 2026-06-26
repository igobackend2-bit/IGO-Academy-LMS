/**
 * db-init — creates the isolated LMS schema (DB_SCHEMA, default `igo_lms`) if it
 * does not exist. Run ONCE before the first `npm run migrate`.
 *
 * SAFETY: the only statement this issues is `CREATE SCHEMA IF NOT EXISTS <schema>`.
 * It never reads, alters, or drops any existing table/schema in the database.
 *
 * Run: npm run db:init   (from the server directory)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const ENV = process.env.NODE_ENV || 'development';
const knexConfig = require('../config/knexfile')[ENV];
const SCHEMA = process.env.DB_SCHEMA || 'igo_lms';

// Connect WITHOUT a searchPath so the CREATE SCHEMA runs cleanly.
const db = require('knex')({
  client: knexConfig.client,
  connection: knexConfig.connection,
  pool: { min: 1, max: 2 },
});

(async () => {
  try {
    await db.raw('CREATE SCHEMA IF NOT EXISTS ??', [SCHEMA]);
    console.log(`[db-init] ✅ Schema ready: "${SCHEMA}" (existing tables untouched)`);
  } catch (err) {
    console.error('[db-init] ❌ Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
})();
