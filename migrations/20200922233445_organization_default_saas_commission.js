const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('organization_default_saas_commission', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_id').notNullable().references('organizations.id')
      table.enu('type', ['absolute', 'percent']).notNullable()
      table.decimal('value').notNullable().defaultsTo(0)
      table.boolean('active').defaultsTo(true)
      table.enu('period', ['lifetime', 'personalized']).notNullable()
      table.integer('init_pay_commission').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organization_default_saas_commission')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('organization_default_saas_commission')
}
