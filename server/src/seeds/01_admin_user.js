/**
 * Seed: Create the IGo Academy Super Admin.
 * Credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME) so they
 * are never hardcoded. Run: npm run seed (from server directory).
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@igoacademy.in';
const ADMIN_NAME  = process.env.ADMIN_NAME  || 'IGo Academy Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+919876543210';

exports.seed = async function (knex) {
  const existing = await knex('users').where({ email: ADMIN_EMAIL }).first();
  if (existing) {
    console.log(`[Seed] Admin already exists (${ADMIN_EMAIL}) — skipping`);
    return;
  }

  // No hardcoded fallback password — if ADMIN_PASSWORD isn't set in .env,
  // generate a random one-time password and print it once. It is never stored
  // anywhere except the hash in the database.
  let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    ADMIN_PASSWORD = crypto.randomBytes(12).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 16) + '#7';
    console.log(`[Seed] �