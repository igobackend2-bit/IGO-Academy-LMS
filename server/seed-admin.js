/**
 * One-time script: seed the admin user into igo_lms.users
 * Run: node seed-admin.js
 */
require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('./src/config/knexfile');

const db = knex(knexConfig['development']);

async function main() {
  const email    = 'igobackend2@gmail.com';
  const password = 'IGOAdmin@2026';
  const fullName = 'IGO Admin';

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
