exports.up = function (knex) {
  return knex.schema.alterTable('organization_services_time_to_pay', (table) => {
    table.integer('close_day')
    table.integer('payment_day')
    table.boolean('automatic_closure')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organization_services_time_to_pay', (table) => {
    table.dropColumn('close_day')
    table.dropColumn('payment_day')
    table.dropColumn('automatic_closure')
  })
}
