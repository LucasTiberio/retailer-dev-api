const Knex = require("knex");
const knexfile = require("../knexfile");

exports.up = async function (knex) {
  return knex.schema
    .createTable("organization_integration_secrets", (table) => {
      table
        .uuid("id")
        .unique()
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table.boolean("active").defaultsTo(true).notNullable();
      table.text("type").notNullable();
      table.text("identifier").notNullable();
      table
        .uuid("organization_id")
        .notNullable()
        .references("organizations.id");
      table
        .uuid("integration_secrets_id")
        .notNullable()
        .references("integration_secrets.id");
      table.unique(["type", "organization_id", "integration_secrets_id"]);
      table.timestamps(true, true);
    })
    .then(() =>
      knex.raw(knexfile.onUpdateTrigger("organization_integration_secrets"))
    );
};

exports.down = function (knex) {
  return knex.schema.dropTable("organization_integration_secrets");
};
