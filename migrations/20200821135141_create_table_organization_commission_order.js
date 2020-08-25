const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('organization_commission_order', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_id').notNullable().references('organizations.id')
      table.integer('order').defaultTo(0)
      table.text('type').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organization_commission_order')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('organization_commission_order')
}
