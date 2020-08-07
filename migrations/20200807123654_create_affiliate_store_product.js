const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('affiliate_store_product', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('affiliate_store_id').notNullable().references('affiliate_store.id')
      table.text('product_id').notNullable()
      table.boolean('active').notNullable().defaultsTo(true)
      table.boolean('searchable').notNullable().defaultsTo(true)
      table.integer('order').notNullable()
      table.integer('clicks').notNullable().defaultsTo(0)
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('affiliate_store_product')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('affiliate_store_product')
}
