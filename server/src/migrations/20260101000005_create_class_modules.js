/**
 * Migration: Create class_modules table
 * Recorded video lessons — linked to a course, stored on S3
 */
exports.up = function (knex) {
  return knex.schema.createTable('class_modules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description');
    table.string('video_s3_key', 500); // S3 object key — NOT public URL
    table.integer('duration_secs').defaultTo(0);
    table.integer('order_index').notNullable().defaultTo(0);
    // Minimum watch percentage to mark as complete (admin-configurable per module)
    table.integer('completion_pct').notNullable().defaultTo(80);
    table.boolean('is_published').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('class_modules');
};
