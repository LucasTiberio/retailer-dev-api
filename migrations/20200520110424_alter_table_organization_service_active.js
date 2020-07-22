exports.up = function(knex) {
    return knex.schema.alterTable('organization_services', table => {
        table
            .boolean('active')
            .notNullable()
            .defaultsTo(true);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organization_services', table => {
        table
            .dropColumn('active');
      });
};  