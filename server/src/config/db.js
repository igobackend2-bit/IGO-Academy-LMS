/**
 * Database connection singleton using Knex.js
 * @module config/db
 */
const knex = require('knex');
const knexConfig = require('./knexfile');

const ENV = process.env.NODE_ENV || 'development';

/** @type {import('knex').Knex} */
const db = knex(knexConfig[ENV]);

/**
 * Test database connectivity on startup
 * @returns {Promise<void>}
 */
async function testConnection() {
  try {
    await db.raw('SELECT 1+1 AS result');
    console.log(`[DB] PostgreSQL connected — env: ${ENV}`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { db, testConnection };
