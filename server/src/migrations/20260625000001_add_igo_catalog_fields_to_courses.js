/**
 * Migration: Add IGO catalog fields to courses.
 * Pure additive — no existing columns altered or removed.
 */
exports.up = function (knex) {
  return knex.schema.table('courses', (table) => {
    table.string('category', 50);           // Horticulture / Aquaculture / Agri-Biz / Tech
    table.string('level', 20);              // beginner / intermediate / advanced
    table.text('prerequisites');
    table.decimal('price', 10, 2).defaultTo(0);
    table.decimal('rating', 3, 2);
    table.string('short_description', 500);
  });
};

exports.down = function (knex) {
  return knex.schema.table('courses', (table) => {
    table.dropColumn('category');
    table.dropColumn('level');
    table.dropColumn('prerequisites');
    table.dropColumn('price');
    table.dropColumn('rating');
    table.dropColumn('short_description');
  });
};
