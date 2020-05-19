exports.up = function(knex) {
    return knex.schema.alterTable('users_organizations', table => {
        table.unique(['user_id','organization_id']);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organizations', table => {
        table.dropUnique(['user_id','organization_id']);
      });
};