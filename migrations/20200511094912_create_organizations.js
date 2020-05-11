const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('organizations',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('name')
            .unique()
            .notNullable();
        table
            .text('contact_email')
            .notNullable();
        table
            .uuid('user_id')
            .notNullable()
            .references('users.id');
        table
            .boolean('active')
            .defaultsTo(true)
            .notNullable();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('organizations')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('organizations');
};