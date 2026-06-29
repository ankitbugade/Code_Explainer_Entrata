// src/db.ts
import knex from 'knex';
import config from '../knexfile';

export const db = knex(config);
