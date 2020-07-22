exports.up = function(knex) {
    return knex.schema.alterTable('organizations', table => {
        table
            .text('logo')
            .unique();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('organizations', table => {
        table
            .dropColumn('logo');
      });
};  