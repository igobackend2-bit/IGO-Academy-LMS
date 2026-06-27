exports.up = function (knex) {
  return knex.schema.alterTable('resources', (table) => {
    table.string('pdf_path', 500).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('resources', (table) => {
    table.dropColumn('pdf_path');
  });
};
