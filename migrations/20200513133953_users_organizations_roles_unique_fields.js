exports.up = function(knex) {
    return knex.schema.alterTable('users_organization_roles', table => {
        table.unique(['user_id','organization_id','organization_role_id']);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organization_roles', table => {
        table.dropUnique(['user_id','organization_id','organization_role_id']);
      });
};