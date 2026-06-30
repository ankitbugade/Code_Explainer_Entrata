// backend/migrations/2024_add_userid_to_snippets.js

exports.up = async function up(knex) {
  // Ensure users table exists before adding foreign key
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').notNullable().unique();
      table.string('password_hash').notNullable();
      table.timestamps(true, true);
    });
  }

  // Add nullable user_id column with foreign key
  await knex.schema.alterTable('snippets', (table) => {
    table.uuid('user_id');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
};

exports.down = async function down(knex) {
  // Remove foreign key and column
  await knex.schema.alterTable('snippets', (table) => {
    table.dropForeign(['user_id']);
    table.dropColumn('user_id');
  });
  // Optionally drop users table if desired (commented out to avoid data loss)
  // await knex.schema.dropTableIfExists('users');
};
