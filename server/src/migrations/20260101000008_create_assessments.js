/**
 * Migration: Create assessments table
 * Quizzes, assignments, and projects linked to a course
 */
exports.up = function (knex) {
  return knex.schema.createTable('assessments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.enum('type', ['quiz', 'assignment', 'project']).notNullable();
    // questions JSONB for quizzes: [{ id, text, type, options: [], correct_answer, points }]
    table.jsonb('questions');
    table.integer('max_score').defaultTo(100);
    table.integer('pass_score').defaultTo(60);
    table.timestamp('deadline');
    table.integer('max_attempts').defaultTo(1);
    // timer_mins: null = no timer, integer = timed quiz
    table.integer('timer_mins');
    table.boolean('shuffle_questions').defaultTo(false);
    table.boolean('shuffle_options').defaultTo(false);
    table.boolean('is_published').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('assessments');
};
