/**
 * Extends batches with the fields needed for admin batch management and
 * the homepage's "Upcoming Programs" section (doc §4.9 / §9): fee, mode,
 * registration status, and optional seat availability.
 */
exports.up = function (knex) {
  return knex.schema.alterTable('batches', (table) => {
    table.decimal('fee', 10, 2).nullable(); // null = use the course's own price
    table.string('mode', 30).nullable(); // Online | Offline | Hybrid | Institutional / Corporate Training
    table
      .enu('registration_status', ['Open', 'Closed', 'Full'], { useNative: true, enumName: 'batch_registration_status' })
      .notNullable().defaultTo('Open');
    table.integer('seats_available').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('batches', (table) => {
    table.dropColumn('fee');
    table.dropColumn('mode');
    table.dropColumn('registration_status');
    table.dropColumn('seats_available');
  }).then(() => knex.raw('DROP TYPE IF EXISTS igo_lms.batch_registration_status'));
};
