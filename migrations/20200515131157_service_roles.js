const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('service_roles',(table) => {
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
            .timestamps(true, true);
        }).then(() => knex.raw(knexfile.onUpdateTrigger('service_roles')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('service_roles');
};