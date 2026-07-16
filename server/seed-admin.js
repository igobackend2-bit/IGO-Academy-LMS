/**
 * One-time script: seed/reset the admin user into igo_lms.users
 * Credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME) so they
 * are never hardcoded. Run: node seed-admin.js
 */
require('dotenv').config({ path: './.env' });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('./src/config/knexfile');

const db = knex(knexConfig['development']);

async function main() {
  const email    = process.env.ADMIN_EMAIL || 'admin@igoacademy.in';
  const fullName = process.env.ADMIN_NAME  || 'IGO Admin';
  let   password = process.env.ADMIN_PASSWORD;
  if (!password) {
    password = crypto.randomBytes(12).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, 16) + '#7';
    console.log(`[seed] No ADMIN_PASSWORD set — generated one-time password: ${password}`);
  }

  // Check if already exists
  const existing = await db('users').where({ email }).first();
  if (existing) {
    console.log(`[seed] User ${email} already exists (id: ${existing.id})`);
    console.log('[seed] Updating password hash and ensuring is_active=true …');
    const password_hash = await bcrypt.hash(password, 12);
    await db('users').where({ email }).update({ password_hash, is_active: true, role: 'admin' });
    console.log('[seed] Done — password updated.');
    await db.destroy();
    return;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const [user] = await db('users').insert({
    full_name:     fullName,
    email,
    password_hash,
    role:          'admin',
    is_active:     true,
    otp_verified:  true,
  }).returning('*');

  console.log(`[seed] Admin user created — id: ${user.id}, email: ${user.email}`);
  await db.destroy();
}

main().catch(err => {
  console.error('[seed] ERROR:', err.message);
  process.exit(1);
});
