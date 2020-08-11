const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema.alterTable('affiliate_store', (table) => {
    table.text('slug').unique()
    table.uuid('organization_id').notNullable().references('organizations.id')
    table.unique(['slug', 'organization_id'])
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('affiliate_store', (table) => {
    table.dropColumn('slug')
  })
}
