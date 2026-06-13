/**
 * Migration: Create courses table
 * Each course is owned by a trainer, has configurable completion criteria
 */
exports.up = function (knex) {
  return knex.schema.createTable('courses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('thumbnail_url', 500);
    table.integer('duration_hours').defaultTo(0);
    table.uuid('trainer_id').references('id').inTable('users').onDelete('SET NULL');
    // completion_criteria: { attendance_pct: 80, min_score: 60 }
    table.jsonb('completion_criteria').defaultTo(JSON.stringify({ attendance_pct: 80, min_score: 60 }));
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('courses');
};
