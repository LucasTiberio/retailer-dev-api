exports.up = function (knex) {
  return knex.schema.alterTable('organization_white_label_customization', (table) => {
    table.text('custom_domain').unique()
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('organization_white_label_customization', (table) => {
    table.dropColumn('custom_domain')
  })
}
