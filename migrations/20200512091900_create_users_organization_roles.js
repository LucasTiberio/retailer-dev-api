const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('users_organization_roles',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('user_id')
            .notNullable()
            .references('users.id');
            
        table
            .uuid('users_organization_id')
            .notNullable()
            .references('users_organizations.id');
        table
            .uuid('organization_role_id')
            .notNullable()
            .references('organization_roles.id');
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('users_organization_roles')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_organization_roles');
};