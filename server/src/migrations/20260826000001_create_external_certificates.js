/**
 * Migration: Create external_certificates table
 *
 * Separate from `certificates` (which only holds certificates the platform
 * itself auto-generates when a student passes an assessment on an IGO
 * Academy course — see certificate.service.js). This table is for real
 * certificates issued by outside, government-recognised bodies (e.g. TN
 * Skill Corporation) for IGO Academy trainees — added manually by an admin
 * via Admin → Certificates, with the actual issued PDF attached as proof,
 * so they can be verified at igoacademy.in/verify/:certId the same way as
 * platform-issued certificates. Added 26 Aug 2026.
 */
exports.up = function (knex) {
  return knex.schema.createTable('external_certificates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('certificate_no', 100).notNullable().unique();
    table.string('enrollment_no', 100);
    table.string('student_name', 200).notNullable();
    table.string('course_name', 200).notNullable();
    table.string('sector', 100);
    table.string('training_centre', 200);
    table.string('duration', 100);
    table.string('issuing_body', 200).notNullable().defaultTo('TN Skill Corporation');
    table.timestamp('issued_at');
    table.string('pdf_path', 500);
    table.boolean('is_valid').notNullable().defaultTo(true);
    table.text('revoked_reason');
    table.uuid('added_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);

    table.index('certificate_no');
    table.index('enrollment_no');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('external_certificates');
};
