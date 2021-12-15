exports.up = function(knex) {
    return knex.schema.alterTable('organizations', (table) => {
      table
          .text('contact_email')
          .nullable()
          .alter();
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('organizations', (table) => {
      table
          .text('contact_email')
          .notNullable()
          .alter();
    })
  };
  
