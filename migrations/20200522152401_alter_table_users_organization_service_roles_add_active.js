exports.up = function(knex) {
    return knex.schema.alterTable('users_organization_service_roles', table => {
        table
            .boolean('active')
            .notNullable()
            .defaultsTo(true);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organization_service_roles', table => {
        table
            .dropColumn('active');
      });
};  