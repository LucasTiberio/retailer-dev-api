const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organization_vtex_comission',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('organization_id')
            .notNullable()
            .references('organizations.id');
        table
            .text('vtex_department_id')
            .unique()
            .notNullable();
        table
            .boolean('active')
            .notNullable()
            .defaultsTo(true);
        table
            .integer('vtex_commission_percentage')
            .notNullable();
        table
            .unique(['organization_id','vtex_department_id', 'vtex_commission_percentage']);
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organization_vtex_comission')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organization_vtex_comission');
};