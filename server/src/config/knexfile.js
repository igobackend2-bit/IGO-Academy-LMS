/**
 * Knex configuration — connects to Supabase PostgreSQL
 * @module config/knexfile
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const baseConnection = {
  host:     process.env.DB_HOST || 'db.kbdbbwsesdmfvkcurjmg.supabase.co',
  port:     parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};

module.exports = {
  development: {
    client: 'postgresql',
    connection: { ...baseConnection, ssl: { rejectUnauthorized: false } },
    pool: { min: 2, max: 10 },
    migrations: { directory: '../migrations', tableName: 'knex_migrations' },
    seeds:      { directory: '../seeds' },
  },
  production: {
    client: 'postgresql',
    connection: { ...baseConnection, ssl: { rejectUnauthorized: true } },
    pool: { min: 2, max: 20 },
    migrations: { directory: '../migrations', tableName: 'knex_migrations' },
  },
};
