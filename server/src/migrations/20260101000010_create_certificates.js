/**
 * Migration: Create certificates table
 * Auto-generated certificates with unique IGO-YYYY-XXXXXX IDs
 */
exports.up = function (knex) {
  return knex.schema.createTable('certificates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    // Human-readable unique ID: IGO-2026-A4X9KZ
    table.string('certificate_id', 20).notNullable().unique();
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.string('pdf_s3_key', 500).notNullable();
    table.timestamp('issued_at').defaultTo(knex.fn.now());
    table.boolean('is_valid').notNullable().defaultTo(true);
    table.text('revoked_reason');
    table.timestamp('revoked_at');
    table.uuid('revoked_by').references('id').inTable('users').onDelete('SET NULL');

    table.index('certificate_id');
    table.index('student_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('certificates');
};
