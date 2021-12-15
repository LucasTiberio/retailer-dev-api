const knexfile = require('../knexfile')

exports.up = function(knex) {
  return knex.schema
    .createTable('organizations_address', (table) => {
      table.uuid('id').unique().primary().defaultTo(knex.raw('uuid_generate_v4()'))
      table.text('cep').notNullable()
      table.text('address').notNullable()
      table.text('number').notNullable()
      table.text('complement')
      table.text('neighbourhood').notNullable()
      table.text('state').notNullable()
      table.text('city').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger('organizations_address')))
};

exports.down = function(knex) {
  return knex.schema.dropTable('organizations_address')
};
