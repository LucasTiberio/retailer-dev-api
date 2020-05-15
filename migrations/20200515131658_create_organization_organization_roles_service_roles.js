const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('users_organization_service_roles',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('service_roles_id')
            .notNullable()
            .references('service_roles.id');
        table
            .uuid('users_organization_id')
            .notNullable()
            .references('users_organizations.id');
        table
            .uuid('organization_services_id')
            .notNullable()
            .references('organization_services.id');
        table
            .unique(['service_roles_id','users_organization_id', 'organization_services_id']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('users_organization_service_roles')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_organization_service_roles');
};