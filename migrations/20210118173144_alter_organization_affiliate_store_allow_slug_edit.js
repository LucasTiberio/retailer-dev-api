exports.up = function (knex) {
  return knex.schema.alterTable('organization_affiliate_store', (table) => {
    table.boolean('allow_slug_edit').defaultsTo(false).notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organization_affiliate_store', (table) => {
    table.dropColumn('allow_slug_edit')
  })
}
