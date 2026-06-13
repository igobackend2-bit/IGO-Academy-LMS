/**
 * Migration: Create submissions table
 * Student responses to quizzes, assignments, and projects
 */
exports.up = function (knex) {
  return knex.schema.createTable('submissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('assessment_id').notNullable().references('id').inTable('assessments').onDelete('CASCADE');
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    // answers: quiz answers JSONB [{ question_id, selected_answer }]
    table.jsonb('answers');
    // file_urls: S3 keys for uploaded files (assignment/project)
    table.jsonb('file_urls');
    // external_links: for project submissions
    table.jsonb('external_links');
    table.integer('score');
    table.text('feedback');
    table.uuid('graded_by').references('id').inTable('users').onDelete('SET NULL');
    table.integer('attempt_number').notNullable().defaultTo(1);
    table.enum('status', ['submitted', 'graded', 'revision_requested', 'resubmitted']).defaultTo('submitted');
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.timestamp('graded_at');
    table.timestamps(true, true);

    table.index(['assessment_id', 'student_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('submissions');
};
