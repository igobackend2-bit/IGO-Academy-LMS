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
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const DB_SCHEMA = process.env.DB_SCHEMA || 'igo_lms';

const baseConnection = {
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

module.exports = {
  development: {
    client: 'postgresql',
    connection: { ...baseConnection, ssl: { rejectUnauthorized: false } },
    searchPath: [DB_SCHEMA],
    pool: { min: 2, max: 10 },
    migrations: { directory: '../migrations', schemaName: DB_SCHEMA, tableName: 'knex_migrations' },
    seeds:      { directory: '../seeds' },
  },
  production: {
    client: 'postgresql',
    connection: { ...baseConnection, ssl: { rejectUnauthorized: true } },
    searchPath: [DB_SCHEMA],
    pool: { min: 2, max: 20 },
    migrations: { directory: '../migrations', schemaName: DB_SCHEMA, tableName: 'knex_migrations' },
  },
};

module.exports.DB_SCHEMA = DB_SCHEMA;
