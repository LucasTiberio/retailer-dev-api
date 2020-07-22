const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_vtex_secrets',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('organization_id')
            .notNullable()
            .references('organizations.id');
        table
            .text('store_name')
            .unique()
            .notNullable();
        table
            .text('vtex_key')
            .notNullable();
        table
            .text('vtex_token')
            .notNullable();
        table
            .unique(['vtex_key','vtex_token']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_vtex_secrets')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_vtex_secrets');
};