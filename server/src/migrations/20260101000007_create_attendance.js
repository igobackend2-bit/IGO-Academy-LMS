/**
 * Migration: Create attendance table
 * Tracks per-student attendance for both live and recorded classes.
 * For live: focus_minutes + exit_events
 * For recorded: watch_pct (active time only)
 */
exports.up = function (knex) {
  return knex.schema.createTable('attendance', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    // class_id points to either live_classes.id or class_modules.id depending on class_type
    table.uuid('class_id').notNullable();
    table.enum('class_type', ['live', 'recorded']).notNullable();
    table.enum('status', ['present', 'absent', 'partial']).notNullable().defaultTo('absent');
    // Live class specific
    table.integer('focus_minutes').defaultTo(0);
    table.integer('exit_events').defaultTo(0);
    // Recorded class specific — only active (non-skipped) watch time
    table.integer('watch_pct').defaultTo(0);
    table.integer('watched_seconds').defaultTo(0);
    // Last playback position for resume
    table.integer('last_position_secs').defaultTo(0);
    table.boolean('completed').notNullable().defaultTo(false);
    table.timestamp('marked_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.index(['student_id', 'class_id', 'class_type']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attendance');
};
