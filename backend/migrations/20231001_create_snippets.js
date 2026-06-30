exports.up = async function up(knex) {
  await knex.schema.createTable('snippets', (table) => {
    table.uuid('id').primary();
    table.enu('language', ['python', 'javascript']).notNullable();
    table.text('code').notNullable();
    table.text('summary');
    table.text('explanation');
    table.text('optimized_code');
    table.text('time_complexity');
    table.text('space_complexity');
    table.integer('confidence');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('snippets');
};
