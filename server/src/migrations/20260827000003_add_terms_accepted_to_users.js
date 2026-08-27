/**
 * Records when a student accepted the Terms & Conditions / Privacy Policy
 * at signup — evidentiary record for the consent checkbox on RegisterPage,
 * not just a client-side UI gate. Nullable: existing accounts predate this
 * and were never asked, so backfilling a fake timestamp would misrepresent
 * when consent was actually given.
 */
exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.timestamp('terms_accepted_at').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('terms_accepted_at');
  });
};
