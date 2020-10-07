exports.up = function (knex) {
  return knex.schema.alterTable('organization_default_saas_commission', (table) => {
    table.enu('form_of_payment', ['recurrency', 'unique']).notNullable().defaultsTo('recurrency')
    table.boolean('advanced_options').notNullable().defaultsTo(false)
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organization_default_saas_commission', (table) => {
    table.dropColumn('form_of_payment')
    table.dropColumn('advanced_options')
  })
}
