const dotenv = require('dotenv');
dotenv.config();

const config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
};

module.exports = config;
