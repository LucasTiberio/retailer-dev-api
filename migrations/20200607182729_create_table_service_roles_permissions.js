const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('service_roles_permissions',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('permission_id')
            .notNullable()
            .references('permissions.id');
        table
            .uuid('service_role_id')
            .notNullable()
            .references('service_roles.id');
        table
            .uuid('service_id')
            .notNullable()
            .references('services.id');
        table
            .enu('grant', ['hide', 'write', 'read'])
            .defaultsTo('hide')
            .notNullable();
        table
            .unique(['service_role_id','permission_id']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('service_roles_permissions')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('service_roles_permissions');
};