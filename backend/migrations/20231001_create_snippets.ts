import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
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
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('snippets');
}
