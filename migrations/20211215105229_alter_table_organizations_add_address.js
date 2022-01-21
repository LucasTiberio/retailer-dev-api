
exports.up = function(knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.uuid('organization_address_id').references('organizations_address.id')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('organizations', (table) => {
    table.dropColumn('organization_address_id')
  })
};
