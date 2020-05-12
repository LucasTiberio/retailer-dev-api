const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_services',(table) => {
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
            .uuid('service_id')
            .notNullable()
            .references('services.id');
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_services')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_services');
};