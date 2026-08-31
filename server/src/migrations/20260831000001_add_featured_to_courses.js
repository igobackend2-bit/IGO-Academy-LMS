/**
 * Adds admin control over which courses show as "Popular/Featured" on the
 * app, and lets the admin manually rank them. `featured_rank` is nullable
 * and only meaningful when `is_featured` is true — non-featured courses
 * keep it null rather than sorting into the ranking at all.
 */
exports.up = function (knex) {
  return knex.schema.alterTable('courses', (table) => {
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.integer('featured_rank').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('courses', (table) => {
    table.dropColumn('is_featured');
    table.dropColumn('featured_rank');
  });
};
