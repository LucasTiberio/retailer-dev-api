const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('affiliate_vtex_campaign',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('vtex_campaign_id')
            .notNullable();
        table
            .text('vtex_campaign_target_configuration_id')
            .notNullable();
        table
            .uuid('users_organization_service_roles_id')
            .notNullable()
            .unique()
            .references('users_organization_service_roles.id');
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('affiliate_vtex_campaign')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('affiliate_vtex_campaign');
};