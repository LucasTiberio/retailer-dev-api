const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('organization_affiliate_store_banner', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_affiliate_store_id').notNullable().references('organization_affiliate_store.id')
      table.text('url').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organization_affiliate_store_banner')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('organization_affiliate_store_banner')
}
