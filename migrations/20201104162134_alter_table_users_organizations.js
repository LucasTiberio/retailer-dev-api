exports.up = function (knex) {
  return knex.schema.alterTable('users_organizations', (table) => {
    table.boolean('is_requested').defaultsTo(false)
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('users_organizations', (table) => {
    table.dropColumn('is_requested')
  })
}
