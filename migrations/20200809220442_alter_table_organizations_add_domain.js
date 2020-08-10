const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.text('domain')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.dropColumn('domain')
  })
}
