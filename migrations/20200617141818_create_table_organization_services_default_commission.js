const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_services_def_commission',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .integer('percentage')
            .notNullable();
        table
            .uuid('organization_service_id')
            .notNullable()
            .references('organization_services.id')
            .unique();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_services_def_commission')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_services_def_commission');
};