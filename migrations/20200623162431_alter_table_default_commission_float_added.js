const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.alterTable('organization_services_def_commission', table => {
        table
        .decimal('percentage')
        .alter();
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organization_services_def_commission', table => {
        table
        .integer('percentage')
        .alter();
    });
};