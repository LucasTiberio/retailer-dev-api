exports.up = function(knex) {
    return knex.schema.alterTable('users_organization_roles', table => {
        table
            .dropColumn('user_id');
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organization_roles', table => {
        table
            .uuid('user_id')
            .notNullable()
            .references('users.id');
      });
};  