import knex from "knex";
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};
export default config;
