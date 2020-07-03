const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.alterTable('organizations',(table) => {
        table
            .boolean('free_trial');
        table
            .datetime('free_trial_expires');
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organizations',(table) => {
        table
            .dropColumn('free_trial');
        table
            .dropColumn('free_trial_expires');
    });
};