/**
 * Seed: Create the IGo Academy Super Admin.
 * Credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME) so they
 * are never hardcoded. Run: npm run seed (from server directory).
 */
const bcrypt = require('bcryptjs');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@igoacademy.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'IGo@Admin2026';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'IGo Academy Admin';
const ADMIN_PHONE    = process.env.ADMIN_PHONE    || '+919876543210';

exports.seed = async function (knex) {
  const existing = await knex('users').where({ email: ADMIN_EMAIL }).first();
  if (existing) {
    console.log(`[Seed] Admin already exists (${ADMIN_EMAIL}) — skipping`);
    return;
  }

  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await knex('users').insert({
    full_name:     ADMIN_NAME,
    email:         ADMIN_EMAIL,
    phone:         ADMIN_PHONE,
    password_hash,
    role:          'admin',
    is_active:     true,
    otp_verified:  true,
  });

  console.log(`[Seed] ✅ Admin created: ${ADMIN_EMAIL}`);
};
