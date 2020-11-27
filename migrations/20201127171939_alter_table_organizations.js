exports.up = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.boolean('abandoned_cart').defaultsTo(false)
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.dropColumn('abandoned_cart')
  })
}
