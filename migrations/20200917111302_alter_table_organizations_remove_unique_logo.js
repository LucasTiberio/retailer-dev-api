exports.up = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.text('logo').alter()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.text('logo').unique().alter()
  })
}
