const Knex = require("knex");
const knexfile = require("../knexfile");

exports.up = async function (knex) {
  return knex.schema
    .createTable("integration_secrets", (table) => {
      table
        .uuid("id")
        .unique()
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.text("secret").unique().notNullable();
      table.timestamps(true, true);
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger("integration_secrets")));
};

exports.down = function (knex) {
  return knex.schema.dropTable("integration_secrets");
};
