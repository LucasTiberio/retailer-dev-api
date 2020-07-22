const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = async function(knex) {
    return knex.schema.createTable('image',(table) => {
        table
            .uuid('id')
            .unique()
            .primary()
            .defaultTo(knex.raw('uuid_generate_v4()'));
        table
            .text('mimetype')
            .notNullable();
      table
            .text('url')
            .unique()
            .notNullable();
        table
            .timestamps(true, true)
        }).then(() => knex.raw(knexfile.onUpdateTrigger('image')));
};

exports.down = function(knex) {
    return knex.schema.dropTable('image');
};