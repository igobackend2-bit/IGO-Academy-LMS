/**
 * Migration: Create users table
 * Stores all platform users — admins, trainers, and students
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('phone', 15);
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['admin', 'trainer', 'student']).notNullable().defaultTo('student');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.boolean('otp_verified').notNullable().defaultTo(false);
    table.string('otp_code', 6);
    table.timestamp('otp_expires_at');
    table.timestamp('last_login_at');
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
