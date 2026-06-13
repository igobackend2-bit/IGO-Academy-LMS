/**
 * Migration: Create user_sessions table
 * Tracks active JWT sessions in DB for single-session enforcement.
 * Redis is primary session store; this table is the audit trail.
 */
exports.up = function (knex) {
  return knex.schema.createTable('user_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable();
    table.jsonb('device_info'); // { browser, os, ip }
    table.specificType('ip_address', 'INET');
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('token_hash');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_sessions');
};
