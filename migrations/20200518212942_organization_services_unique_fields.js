exports.up = function(knex) {
    return knex.schema.alterTable('organization_services', table => {
        table.unique(['service_id','organization_id']);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organization_services', table => {
        table.dropUnique(['service_id','organization_id']);
      });
};
