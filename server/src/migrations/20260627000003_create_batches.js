exports.up = function (knex) {
  return knex.schema.createTable('batches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.date('start_date').nullable();
    table.date('end_date').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.unique(['course_id', 'name']);
  });
};
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('batches');
};
