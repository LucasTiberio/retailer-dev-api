const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('commission_bonification_rules', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_commission_bonification_id').notNullable().references('organization_commission_bonification.id')
      table.decimal('initial_target').notNullable()
      table.decimal('final_target').notNullable()
      table.boolean('active').defaultsTo(true)
      table.decimal('bonus').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('commission_bonification_rules')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('commission_bonification_rules')
}
