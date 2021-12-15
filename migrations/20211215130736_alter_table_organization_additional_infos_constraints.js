exports.up = function(knex) {
  return knex.schema.alterTable('organization_additional_infos', (table) => {
    table
        .integer('resellers_estimate')
        .nullable()
        .alter();
    table
        .text('reason')
        .nullable()
        .alter();
    table
        .text('plataform')
        .nullable()
        .alter();
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('organization_additional_infos', (table) => {
    table
        .integer('resellers_estimate')
        .notNullable()
        .alter();
    table
        .text('reason')
        .notNullable()
        .alter();
    table
        .text('plataform')
        .notNullable()
        .alter();
  })
};
