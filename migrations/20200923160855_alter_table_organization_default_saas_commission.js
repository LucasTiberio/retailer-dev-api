exports.up = function (knex) {
  return knex.schema.alterTable('organization_default_saas_commission', (table) => {
    table.integer('payment_period').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organization_default_saas_commission', (table) => {
    table.dropColumn('payment_period')
  })
}
