const Knex = require('knex');
const knexfile = require('../knexfile');

exports.up = function(knex) {
    return knex.schema.alterTable('url_shorten', table => {
            table
                .integer('count')
                .defaultsTo(0)
                .notNullable();
          });
};

exports.down = function(knex) {
    return knex.schema.alterTable('url_shorten', table => {
            table
                .dropColumn('count');
          });
};