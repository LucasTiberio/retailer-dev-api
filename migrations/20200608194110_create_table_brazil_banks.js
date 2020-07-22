const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('brazil_banks',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('name')
            .unique()
            .notNullable();
        table
            .text('code')
            .unique()
            .notNullable();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('brazil_banks')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('brazil_banks');
};