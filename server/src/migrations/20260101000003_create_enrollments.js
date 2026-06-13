/**
 * Migration: Create enrollments table
 * Links a student to a course with hard start/end dates.
 * After end_date — access is revoked automatically by cron job.
 */
exports.up = function (knex) {
  return knex.schema.createTable('enrollments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.boolean('is_expired').notNullable().defaultTo(false);
    table.decimal('paid_amount', 10, 2).defaultTo(0);
    table.timestamp('enrolled_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    // A student can only be enrolled in a course once at a time
    table.unique(['student_id', 'course_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('enrollments');
};
