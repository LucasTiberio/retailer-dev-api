exports.up = function(knex) {
    return knex.schema.alterTable('users_organization_roles', table => {
        table
            .enu('invite_status', ['refused', 'pendent', 'accept'])
            .defaultsTo('pendent')
            .notNullable();
        table
            .text('invite_hash')
            .unique();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organization_roles', table => {
        table
            .dropColumn('invite_status');
        table
            .dropColumn('invite_hash');
      });
};