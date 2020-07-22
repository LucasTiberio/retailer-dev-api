exports.up = function(knex) {
    return knex.schema.alterTable('organization_vtex_secrets', table => {
        table
            .boolean('status')
            .defaultsTo(true)
            .notNullable();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organization_vtex_secrets', table => {
        table
            .dropColumn('status');
      });
};