exports.up = function (knex) {
  return knex.schema.alterTable('users_organization_service_roles', (table) => {
    table.boolean('showable').defaultsTo(true).notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('users_organization_service_roles', (table) => {
    table.dropColumn('showable')
  })
}
