exports.up = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.text('api_key').unique()
    table.boolean('public').defaultsTo(false).notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.dropColumn('api_key')
    table.dropColumn('public')
  })
}
