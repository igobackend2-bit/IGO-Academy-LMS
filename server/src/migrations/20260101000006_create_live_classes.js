/**
 * Migration: Create live_classes table
 * Scheduled and recorded live sessions run by trainers via WebRTC
 */
exports.up = function (knex) {
  return knex.schema.createTable('live_classes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('trainer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.timestamp('scheduled_at').notNullable();
    table.integer('duration_mins').notNullable().defaultTo(60);
    table.enum('status', ['scheduled', 'live', 'ended']).notNullable().defaultTo('scheduled');
    table.string('recording_s3', 500); // S3 key of auto-recorded session
    table.integer('max_participants').defaultTo(200);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('live_classes');
};
