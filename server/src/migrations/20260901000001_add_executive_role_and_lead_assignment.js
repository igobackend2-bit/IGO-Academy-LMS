/**
 * Adds the "executive" role (IGO Academy executives who call leads and
 * update their status — separate from admin/trainer/student) and the
 * columns needed to assign a lead (enquiries row) to one.
 */
exports.up = async function (knex) {
  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role = ANY (ARRAY['admin'::text, 'trainer'::text, 'student'::text, 'executive'::text]));
  `);

  await knex.schema.alterTable('enquiries', (table) => {
    table.uuid('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('last_contacted_at').nullable();
    table.index(['assigned_to']);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable('enquiries', (table) => {
    table.dropColumn('assigned_to');
    table.dropColumn('last_contacted_at');
  });

  await knex.raw(`
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role = ANY (ARRAY['admin'::text, 'trainer'::text, 'student'::text]));
  `);
};
