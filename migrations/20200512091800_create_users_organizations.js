const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('users_organizations',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .uuid('user_id')
            .notNullable()
            .references('users.id');
        table
            .uuid('organization_id')
            .notNullable()
            .references('organizations.id');
        table
            .enu('invite_status', ['refused', 'pendent', 'accept', 'exited'])
            .defaultsTo('pendent')
            .notNullable();
        table
            .text('invite_hash')
            .unique();
        table
            .timestamps(true, true)
      }).then(() => knex.raw(knexfile.onUpdateTrigger('users_organizations')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('users_organizations');
};