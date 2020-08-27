const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.uuid('terms_and_conditions_id').references('terms_and_conditions.id')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('terms_and_conditions_id')
  })
}
