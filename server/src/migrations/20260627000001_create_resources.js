exports.up = function (knex) {
  return knex.schema.createTable('resources', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.enum('type', ['information', 'note']).notNullable();
    table.string('title', 255).notNullable();
    table.text('content').nullable();
    table.uuid('course_id').nullable().references('id').inTable('courses').onDelete('CASCADE');
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('resources');
};
