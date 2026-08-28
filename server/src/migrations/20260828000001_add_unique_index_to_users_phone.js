/**
 * Phone becomes a real lookup/login key with this session's phone-OTP
 * registration + phone/email login work — a unique index prevents two
 * accounts silently sharing a number. Safe to add now: checked first,
 * 0 duplicate phones exist among current users. Standard Postgres UNIQUE
 * allows multiple NULLs, so the 2 accounts with no phone on file are
 * unaffected.
 */
exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.unique('phone');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropUnique('phone');
  });
};
