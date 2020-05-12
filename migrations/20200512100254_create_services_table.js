const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('services',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('name')
            .notNullable()
            .unique();
        table
            .boolean('active')
            .notNullable()
            .defaultsTo(true);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('services')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('services');
};