exports.up = function(knex) {
    return knex.schema.alterTable('users_organizations', table => {
        table
            .boolean('active')
            .notNullable()
            .defaultsTo(true);
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users_organizations', table => {
        table
            .dropColumn('active');
      });
};  