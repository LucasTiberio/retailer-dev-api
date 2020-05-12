exports.up = function(knex) {
    return knex.schema.alterTable('users', table => {
        table
            .text('username')
            .nullable()
            .alter();
        table
            .text('encrypted_password')
            .nullable()
            .alter();
      });
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', table => {
        table
            .text('username')
            .notNullable()
            .alter();
        table
            .text('encrypted_password')
            .notNullable()
            .alter();
      });
};