// @ts-nocheck
import * as Knex from 'knex';
import knexfile from '../knexfile';

export async function up(knex: Knex): Promise<any> {
    await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    return knex.schema.createTable('users',(table: Knex.TableBuilder) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('username')
            .notNullable();
        table
            .text('email')
            .unique()
            .notNullable();
        table
            .text('encrypted_password')
            .notNullable();
        table
            .timestamps(true, true)
  }).then(() => knex.raw(knexfile.onUpdateTrigger('users')));
}

export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('users');
}