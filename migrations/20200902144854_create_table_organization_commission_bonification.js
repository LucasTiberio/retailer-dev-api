const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('organization_commission_bonification', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_id').notNullable().references('organizations.id')
      table.text('title').notNullable()
      table.enu('type', ['absolute', 'percent']).notNullable()
      table.enu('goal', ['total_sales']).notNullable().defaultsTo('total_sales')
      table.enu('recurrency', ['monthly', 'personalized']).notNullable()
      table.date('start_bonus_valid_at')
      table.boolean('active').defaultsTo(true)
      table.date('end_bonus_valid_at')
      table.enu('bonus_type', ['all_members']).notNullable().defaultsTo('all_members')
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organization_commission_bonification')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('organization_commission_bonification')
}
