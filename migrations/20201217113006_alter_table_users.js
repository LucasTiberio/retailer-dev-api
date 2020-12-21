exports.up = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.text('document')
    table.enu('document_type', ['rg', 'cpf'])
    table.text('phone')
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('document')
    table.dropColumn('document_type')
    table.dropColumn('phone')
  })
}
