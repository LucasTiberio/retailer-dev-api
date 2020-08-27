const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('terms_and_conditions', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.integer('version').notNullable().unique()
      table.text('text').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('terms_and_conditions')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('terms_and_conditions')
}
