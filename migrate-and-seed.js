/**
 * IGo Academy Platform — One-click Migration + Seed Script
 * Run this ONCE to create all tables in Supabase and seed the admin user.
 *
 * How to run:
 *   node migrate-and-seed.js
 *
 * Requires:  node >= 18,  npm install knex pg bcryptjs  (run once in this folder)
 */

// ── Auto-install dependencies if missing ─────────────────────
const { execSync } = require('child_process');
try {
  require('knex');
  require('pg');
  require('bcryptjs');
} catch {
  console.log('📦 Installing required packages...');
  execSync('npm install knex pg bcryptjs', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Packages installed\n');
}

const knex = require('knex')({
  client: 'postgresql',
  connection: {
    host:     'db.kbdbbwsesdmfvkcurjmg.supabase.co',
    port:     5432,
    database: 'postgres',
    user:     'postgres',
    password: 'Igoskills@123',
    ssl:      { rejectUnauthorized: false },
  },
  pool: { min: 1, max: 3 },
});

async function createTable(name, builder) {
  const exists = await knex.schema.hasTable(name);
  if (exists) { console.log(`⏭  ${name} (already exists)`); return; }
  await knex.schema.createTable(name, builder);
  console.log(`✅ Created: ${name}`);
}

async function run() {
  console.log('\n🚀 IGo Academy — Supabase Migration\n' + '─'.repeat(40));

  // Test connection
  try {
    await knex.raw('SELECT 1+1 AS result');
    console.log('✅ Connected to Supabase PostgreSQL\n');
  } catch (err) {
    console.error('❌ Cannot connect to Supabase:', err.message);
    console.error('   Check: DB host, password, and internet connection.');
    process.exit(1);
  }

  // ── 1. users ──────────────────────────────────────────────
  await createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('full_name', 255).notNullable();
    t.string('email', 255).notNullable().unique();
    t.string('phone', 15);
    t.string('password_hash', 255).notNullable();
    t.enu('role', ['admin', 'trainer', 'student']).notNullable().defaultTo('student');
    t.boolean('is_active').notNullable().defaultTo(true);
    t.boolean('otp_verified').notNullable().defaultTo(false);
    t.string('otp_code', 6);
    t.timestamp('otp_expires_at');
    t.timestamp('last_login_at');
    t.timestamps(true, true);
  });

  // ── 2. courses ────────────────────────────────────────────
  await createTable('courses', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('title', 255).notNullable();
    t.text('description');
    t.string('thumbnail_url', 500);
    t.integer('duration_hours').defaultTo(0);
    t.uuid('trainer_id').references('id').inTable('users').onDelete('SET NULL');
    t.jsonb('completion_criteria').defaultTo(JSON.stringify({ attendance_pct: 80, min_score: 60 }));
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });

  // ── 3. enrollments ────────────────────────────────────────
  await createTable('enrollments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.date('start_date').notNullable();
    t.date('end_date').notNullable();
    t.boolean('is_expired').notNullable().defaultTo(false);
    t.decimal('paid_amount', 10, 2).defaultTo(0);
    t.timestamp('enrolled_at').defaultTo(knex.fn.now());
    t.timestamps(true, true);
    t.unique(['student_id', 'course_id']);
  });

  // ── 4. user_sessions ──────────────────────────────────────
  await createTable('user_sessions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token_hash', 255).notNullable();
    t.jsonb('device_info');
    t.specificType('ip_address', 'INET');
    t.timestamp('expires_at').notNullable();
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('user_id');
    t.index('token_hash');
  });

  // ── 5. class_modules ──────────────────────────────────────
  await createTable('class_modules', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.text('description');
    t.string('video_s3_key', 500);
    t.integer('duration_secs').defaultTo(0);
    t.integer('order_index').notNullable().defaultTo(0);
    t.integer('completion_pct').notNullable().defaultTo(80);
    t.boolean('is_published').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

  // ── 6. live_classes ───────────────────────────────────────
  await createTable('live_classes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.uuid('trainer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('title', 255).notNullable();
    t.timestamp('scheduled_at').notNullable();
    t.integer('duration_mins').notNullable().defaultTo(60);
    t.enu('status', ['scheduled', 'live', 'ended']).notNullable().defaultTo('scheduled');
    t.string('recording_s3', 500);
    t.integer('max_participants').defaultTo(200);
    t.timestamps(true, true);
  });

  // ── 7. attendance ─────────────────────────────────────────
  await createTable('attendance', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('class_id').notNullable();
    t.enu('class_type', ['live', 'recorded']).notNullable();
    t.enu('status', ['present', 'absent', 'partial']).notNullable().defaultTo('absent');
    t.integer('focus_minutes').defaultTo(0);
    t.integer('exit_events').defaultTo(0);
    t.integer('watch_pct').defaultTo(0);
    t.integer('watched_seconds').defaultTo(0);
    t.integer('last_position_secs').defaultTo(0);
    t.boolean('completed').notNullable().defaultTo(false);
    t.timestamp('marked_at').defaultTo(knex.fn.now());
    t.timestamps(true, true);
    t.index(['student_id', 'class_id', 'class_type']);
  });

  // ── 8. assessments ────────────────────────────────────────
  await createTable('assessments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    t.string('title', 255).notNullable();
    t.enu('type', ['quiz', 'assignment', 'project']).notNullable();
    t.jsonb('questions');
    t.integer('max_score').defaultTo(100);
    t.integer('pass_score').defaultTo(60);
    t.timestamp('deadline');
    t.integer('max_attempts').defaultTo(1);
    t.integer('timer_mins');
    t.boolean('shuffle_questions').defaultTo(false);
    t.boolean('shuffle_options').defaultTo(false);
    t.boolean('is_published').defaultTo(false);
    t.timestamps(true, true);
  });

  // ── 9. submissions ────────────────────────────────────────
  await createTable('submissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('assessment_id').notNullable().references('id').inTable('assessments').onDelete('CASCADE');
    t.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.jsonb('answers');
    t.jsonb('file_urls');
    t.jsonb('external_links');
    t.integer('score');
    t.text('feedback');
    t.uuid('graded_by').references('id').inTable('users').onDelete('SET NULL');
    t.integer('attempt_number').notNullable().defaultTo(1);
    t.enu('status', ['submitted', 'graded', 'revision_requested', 'resubmitted']).defaultTo('submitted');
    t.timestamp('submitted_at').defaultTo(knex.fn.now());
    t.timestamp('graded_at');
    t.timestamps(true, true);
    t.index(['assessment_id', 'student_id']);
  });

  // ── 10. certificates ──────────────────────────────────────
  await createTable('certificates', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('certificate_id', 20).notNullable().unique();
    t.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    t.string('pdf_s3_key', 500).notNullable();
    t.timestamp('issued_at').defaultTo(knex.fn.now());
    t.boolean('is_valid').notNullable().defaultTo(true);
    t.text('revoked_reason');
    t.timestamp('revoked_at');
    t.uuid('revoked_by').references('id').inTable('users').onDelete('SET NULL');
    t.index('certificate_id');
    t.index('student_id');
  });

  console.log('\n🎉 All 10 tables created in Supabase!\n');

  // ── Seed Admin User ───────────────────────────────────────
  const bcrypt = require('bcryptjs');
  console.log('─'.repeat(40));
  console.log('👤 Seeding Admin User...');

  const existing = await knex('users').where({ email: 'admin@igoacademy.in' }).first();
  if (!existing) {
    const password_hash = await bcrypt.hash('IGo@Admin2026', 12);
    await knex('users').insert({
      full_name:    'IGo Academy Admin',
      email:        'admin@igoacademy.in',
      phone:        '+919876543210',
      password_hash,
      role:         'admin',
      is_active:    true,
      otp_verified: true,
    });
    console.log('✅ Admin created!');
    console.log('   Email    : admin@igoacademy.in');
    console.log('   Password : IGo@Admin2026');
    console.log('   ⚠️  Change password after first login!\n');
  } else {
    console.log('⏭  Admin already exists — skipping\n');
  }

  // ── Show all tables ───────────────────────────────────────
  const result = await knex.raw(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('📊 Tables in your Supabase database:');
  result.rows.forEach(r => console.log(`   • ${r.table_name}`));

  console.log('\n✅ Setup complete! You can now start the platform.\n');
  await knex.destroy();
}

run().catch(err => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
