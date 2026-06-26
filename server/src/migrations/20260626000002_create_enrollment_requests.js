/**
 * Migration: Create enrollment_requests table
 * Students request access; admin approves/rejects.
 */
exports.up = function (knex) {
  return knex.schema.createTable('enrollment_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.text('student_message');
    table.text('admin_note');
    table.uuid('reviewed_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('reviewed_at').nullable();
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    table.unique(['student_id', 'course_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enrollment_requests');
};
