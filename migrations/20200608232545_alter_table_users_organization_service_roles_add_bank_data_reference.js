exports.up = function(knex) {
    return knex.schema.alterTable('users_organization_service_roles', table => {
        table
            .uuid('bank_data_id')
            .references('banks_data.id');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organization_service_roles', table => {
        table
            .dropColumn('bank_data_id');
      });
};  