const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_additional_infos',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('segment')
            .notNullable();
        table
            .integer('resellers_estimate')
            .notNullable();
        table
            .text('reason')
            .notNullable();
        table
            .text('plataform')
            .notNullable();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_additional_infos')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_additional_infos');
};