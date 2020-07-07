const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.alterTable('organizations',(table) => {
        table
            .boolean('free_trial');
        table
            .datetime('free_trial_expires');
        table
            .string('phone');
        table
            .uuid('organization_additional_infos_id')
            .notNullable()
            .references('organization_additional_infos.id')
            .unique();
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organizations',(table) => {
        table
            .dropColumn('free_trial');
        table
            .dropColumn('free_trial_expires');
        table
            .dropColumn('phone');
        table
            .dropColumn('organization_additional_infos_id');
    });
};