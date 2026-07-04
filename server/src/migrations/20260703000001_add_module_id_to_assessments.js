exports.up = function (knex) {
  return knex.schema.table('assessments', (table) => {
    table.uuid('module_id').nullable().references('id').inTable('class_modules').onDelete('CASCADE');
    table.index('module_id');
  });
};

exports.down = function (knex) {
  return knex.schema.table('assessments', (table) => {
    table.dropColumn('module_id');
  });
};
