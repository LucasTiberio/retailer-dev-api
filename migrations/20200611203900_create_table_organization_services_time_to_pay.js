const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_services_time_to_pay',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('days')
            .notNullable();
        table
            .text('type')
            .notNullable();
        table
            .uuid('organization_service_id')
            .notNullable()
            .references('organization_services.id');
        table
            .unique(['type','organization_service_id']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_services_time_to_pay')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_services_time_to_pay');
};