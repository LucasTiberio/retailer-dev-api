const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('banks_data',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('agency')
            .notNullable();
        table
            .text('account')
            .notNullable();
        table
            .text('account_digit')
            .notNullable();
        table
            .text('document')
            .notNullable();
        table
            .text('name')
            .notNullable();
        table
            .uuid('brazil_bank_id')
            .notNullable()
            .references('brazil_banks.id');
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('banks_data')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('banks_data');
};