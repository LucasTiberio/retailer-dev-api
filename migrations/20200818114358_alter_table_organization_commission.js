const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema.alterTable('organization_commission', (table) => {
    table.text('identifier')
    table.text('identifier_id')
    table.text('department_id').alter()
    table.dropUnique(['organization_id', 'department_id', 'type'])
    table.unique(['organization_id', 'identifier', 'identifier_id', 'type'])
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organization_commission', (table) => {
    table.dropColumn('identifier')
    table.dropColumn('identifier_id')
    table.text('department_id').notNullable().alter()
    table.unique(['organization_id', 'department_id', 'type'])
    table.dropUnique(['organization_id', 'identifier', 'identifier_id', 'type'])
  })
}
