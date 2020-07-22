const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_roles_permissions',(table) => {
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
            .uuid('organization_role_id')
            .notNullable()
            .references('organization_roles.id');
        table
            .enu('grant', ['hide', 'write', 'read'])
            .defaultsTo('hide')
            .notNullable();
        table
            .unique(['organization_role_id','permission_id']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_roles_permissions')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_roles_permissions');
};