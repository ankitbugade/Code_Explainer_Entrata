// backend/migrations/2024_add_users_table.js

exports.up = async function up(knex) {
  const exists = await knex.schema.hasTable('users');
  if (!exists) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').notNullable().unique();
      table.string('password_hash').notNullable();
      table.timestamps(true, true);
    });
  }
};

exports.down = async function down(knex) {
  const exists = await knex.schema.hasTable('users');
  if (exists) {
    await knex.schema.dropTable('users');
  }
};
