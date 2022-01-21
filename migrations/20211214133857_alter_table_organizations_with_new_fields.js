
exports.up = function(knex) {
    return knex.schema.alterTable('organizations', table => {
      table.text('document')
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('organizations', table => {
      table.dropColumn('document')
    })
  };
  