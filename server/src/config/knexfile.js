/**
 * Knex configuration — connects to Supabase PostgreSQL.
 *
 * ISOLATION: every LMS table lives in a dedicated Postgres schema (DB_SCHEMA,
 * default `igo_lms`), NOT in `public`. This lets the LMS share a Supabase
 * project with another app without ever touching that app's tables. `searchPath`
 * scopes all queries/migrations/seeds to this schema. The schema itself is
 * created by `npm run db:init` before the first migration.
 *
 * @module config/knexfile
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const DB_SCHEMA = process.env.DB_SCHEMA || 'igo_lms';

const baseConnection = {
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// Supabase's pooler presents a chain rooted in Supabase's own private CA, which
// is absent from Node's trust store — so plain `rejectUnauthorized: true` fails
// with SELF_SIGNED_CERT_IN_CHAIN. Pinning their published root lets production
// keep full certificate verification instead of switching it off.
const SUPABASE_CA = fs.readFileSync(path.join(__dirname, 'supabase-ca-2021.crt'), 'utf8');

// Supabase's pooler (pgbouncer, transaction mode) silently drops idle
// connections after a while. A `min` pool held Tarn onto references that
// looked fine client-side but were already dead server-side -- each drop
// leaked a pool slot instead of being recycled, and over a long-running
// process (a dev server left open for hours, exactly what happened here)
// that eventually exhausts the pool: "Timeout acquiring a connection. The
// pool is probably full." isn't the pool being busy, it's full of corpses.
// min: 0 lets idle connections close instead of being held forever;
// idleTimeoutMillis recycles them client-side before the pooler's own
// timeout gets a chance to kill them out from under us.
const POOL = { min: 0, idleTimeoutMillis: 15000 };

module.exports = {
  development: {
    client: 'postgresql',
    connection: { ...baseConnection, ssl: { rejectUnauthorized: false } },
    searchPath: [DB_SCHEMA],
    pool: { ...POOL, max: 10 },
    migrations: { directory: '../migrations', schemaName: DB_SCHEMA, tableName: 'knex_migrations' },
    seeds:      { directory: '../seeds' },
  },
  production: {
    client: 'postgresql',
    connection: { ...baseConnection, ssl: { ca: SUPABASE_CA, rejectUnauthorized: true } },
    searchPath: [DB_SCHEMA],
    pool: { ...POOL, max: 20 },
    migrations: { directory: '../migrations', schemaName: DB_SCHEMA, tableName: 'knex_migrations' },
  },
};

module.exports.DB_SCHEMA = DB_SCHEMA;
