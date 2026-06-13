/**
 * Seed: Create default IGo Academy Super Admin
 * Run: npm run seed (from server directory)
 * Login: admin@igoacademy.in / IGo@Admin2026
 */
const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
  const existing = await knex('users').where({ email: 'admin@igoacademy.in' }).first();
  if (existing) {
    console.log('[Seed] Admin already exists — skipping');
    return;
  }

  const password_hash = await bcrypt.hash('IGo@Admin2026', 12);

  await knex('users').insert({
    full_name:     'IGo Academy Admin',
    email:         'admin@igoacademy.in',
    phone:         '+919876543210',
    password_hash,
    role:          'admin',
    is_active:     true,
    otp_verified:  true,
  });

  console.log('[Seed] ✅ Admin created: admin@igoacademy.in / IGo@Admin2026');
};
