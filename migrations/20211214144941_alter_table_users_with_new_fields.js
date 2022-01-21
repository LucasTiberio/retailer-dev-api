
exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.date('birth_date')
    table.enu('gender', ['male', 'female', 'undefined'])
    table.string('position')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('birth_date')
    table.dropColumn('gender')
  })
};
