const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    return knex.schema.createTable('users',(table) => {
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
            .boolean('verified')
            .defaultsTo(false)
            .notNullable();
        table
            .text('verification_hash')
            .unique();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('users')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('users');
};