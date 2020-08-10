const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('organization_affiliate_store', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_id').notNullable().references('organizations.id')
      table.boolean('active').notNullable().defaultsTo(false)
      table.text('script_url')
      table.text('shelf_id')
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organization_affiliate_store')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('organization_affiliate_store')
}
