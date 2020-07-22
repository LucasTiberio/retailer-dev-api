const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.alterTable('organization_vtex_secrets',(table) => {
        table
            .dropUnique(['vtex_key','vtex_token']);
        table
            .dropUnique('store_name');
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organization_vtex_secrets',(table) => {
        table
            .unique(['vtex_key','vtex_token']);
        table
            .unique('store_name');
        });
};