const Knex = require('knex')
const knexfile = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('organization_white_label_customization', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.uuid('organization_id').notNullable().references('organizations.id')
      table.text('primary_color')
      table.text('second_color')
      table.text('tertiary_color')
      table.text('logo')
      table.boolean('active').defaultsTo(true)
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organization_white_label_customization')))
}

exports.down = function (knex) {
  return knex.schema.dropTable('organization_white_label_customization')
}
