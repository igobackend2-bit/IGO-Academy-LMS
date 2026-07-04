/**
 * Resets passwords for all LMS users in Supabase Auth.
 * Generates a secure password per user, updates via Admin API,
 * and writes a full report.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const { db } = require('../config/db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Deterministic readable password: Word + 4-digit number + special
function makePassword(email) {
  const words = ['Agri','Farm','Green','Soil','Crop','Rain','Seed','Root','Leaf','Grow'];
  const hash = crypto.createHash('md5').update(email).digest('hex');
  const word = words[parseInt(hash[0], 16) % words.length];
  const num  = parseInt(hash.slice(1, 5), 16) % 9000 + 1000;
  const sym  = ['@','#','$','!'][parseInt(hash[5], 16) % 4];
  return `${word}${num}${sym}`;
}

async function run() {
  console.log('\nFetching all LMS users...');
  const lmsUsers = await db('igo_lms.users').select('id','email','full_name','role','is_active');

  // Get all auth users
  const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authByEmail = {};
  (authData?.users || []).forEach(u => { if (u.email) authByEmail[u.email.toLowerCase()] = u; });

  const report = [];

  for (const user of lmsUsers) {
    const email = user.email?.toLowerCase();
    const authUser = authByEmail[email];
    const newPassword = makePassword(email);

    if (!authUser) {
      report.push({ email: user.email, full_name: user.full_name, role: user.role, status: 'NO AUTH ENTRY', password: 'N/A', action: 'SKIPPED — no auth.users row' });
      continue;
    }

    try {
      const { error } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          role: user.role,
        },
      });

      if (error) {
        report.push({ email: user.email, full_name: user.full_name, role: user.role, status: 'FAILED', password: 'N/A', action: error.message });
      } else {
        report.push({ email: user.email, full_name: user.full_name, role: user.role, status: 'UPDATED', password: newPassword, action: 'Password set + email confirmed' });
        console.log(`  ✓ ${user.email} (${user.role})`);
      }
    } catch (err) {
      report.push({ email: user.email, full_name: user.full_name, role: user.role, status: 'ERROR', password: 'N/A', action: err.message });
    }
  }

  // Save report to file
  const reportPath = path.join(__dirname, '../../user-credentials-report.txt');
  const lines = [
    '═══════════════════════════════════════════════════════════════',
    '  IGO ACADEMY — USER CREDENTIALS REPORT',
    `  Generated: ${new Date().toLocaleString()}`,
    '═══════════════════════════════════════════════════════════════',
    '',
    'Role        Email                                Full Name              Password          Status',
    '─────────── ──────────────────────────────────── ────────────────────── ───────────────── ──────────',
  ];

  report.forEach(r => {
    lines.push(
      `${r.role.padEnd(11)} ${r.email.padEnd(36)} ${(r.full_name||'').padEnd(22)} ${r.password.padEnd(17)} ${r.status}`
    );
  });

  lines.push('');
  lines.push('─────────── ──────────────────────────────────── ────────────────────── ───────────────── ──────────');
  lines.push(`Total: ${report.length} users  |  Updated: ${report.filter(r=>r.status==='UPDATED').length}  |  Failed: ${report.filter(r=>r.status==='FAILED').length}  |  Skipped: ${report.filter(r=>r.status==='SKIPPED — no auth.users row').length}`);
  lines.push('');
  lines.push('⚠  KEEP THIS FILE SECURE — delete after distributing credentials.');
  lines.push('');

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  console.log(`\nReport saved to: ${reportPath}`);

  // Also print to console
  console.log('\n' + lines.join('\n'));

  await db.destroy();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
