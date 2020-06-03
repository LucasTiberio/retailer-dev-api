const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('url_shorten',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('original_url')
            .unique()
            .notNullable();
        table
            .text('short_url')
            .unique()
            .notNullable();
        table
            .text('url_code')
            .unique()
            .notNullable();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('url_shorten')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('url_shorten');
};