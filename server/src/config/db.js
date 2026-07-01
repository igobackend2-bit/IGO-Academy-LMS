/**
 * Database connection singleton using Knex.js
 * @module config/db
 */
const knex = require('knex');
const { createClient } = require('@supabase/supabase-js');
const knexConfig = require('./knexfile');

const ENV = process.env.NODE_ENV || 'development';

/** @type {import('knex').Knex} */
const db = knex(knexConfig[ENV]);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testConnection() {
  try {
    // Try direct pg first
    await db.raw('SELECT 1+1 AS result');
    console.log(`[DB] PostgreSQL connected — env: ${ENV}`);
  } catch (pgErr) {
    // Pooler unavailable — fall back to REST API health check
    console.warn('[DB] Direct pg connection failed:', pgErr.message);
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.error('[DB] Supabase REST also failed:', error.message);
      process.exit(1);
    }
    console.log('[DB] Connected via Supabase REST API — knex queries may fail; using REST fallback');
  }
}

module.exports = { db, supabase, testConnection };
