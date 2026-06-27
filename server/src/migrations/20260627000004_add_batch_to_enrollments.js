exports.up = function (knex) {
  return knex.schema.alterTable('enrollments', (table) => {
    table.uuid('batch_id').nullable().references('id').inTable('batches').onDelete('SET NULL');
  });
};
exports.down = function (knex) {
  return knex.schema.alterTable('enrollments', (table) => {
    table.dropColumn('batch_id');
  });
};
