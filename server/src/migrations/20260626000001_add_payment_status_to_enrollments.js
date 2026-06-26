exports.up = async (knex) => {
  await knex.schema.alterTable('enrollments', (table) => {
    table.string('payment_status', 20).defaultTo('free').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('enrollments', (table) => {
    table.dropColumn('payment_status');
  });
};
