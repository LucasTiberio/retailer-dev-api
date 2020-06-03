const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('users_organization_service_roles_url_shortener',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('users_organization_service_roles_id')
            .notNullable()
            .references('users_organization_service_roles.id');
        table
            .uuid('url_shorten_id')
            .notNullable()
            .references('url_shorten.id');
        table
            .unique(['url_shorten_id','users_organization_service_roles_id']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('users_organization_service_roles_url_shortener')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_organization_service_roles_url_shortener');
};