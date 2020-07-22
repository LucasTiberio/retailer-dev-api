exports.up = function(knex) {
    return knex.schema.alterTable('organization_vtex_comission', table => {
        table.dropUnique(['vtex_department_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organization_vtex_comission', table => {
        table.unique(['vtex_department_id']);
      });
};