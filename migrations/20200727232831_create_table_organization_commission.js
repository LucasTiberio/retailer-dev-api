const Knex = require("knex");
const knexfile = require("../knexfile");

exports.up = async function (knex) {
  return knex.schema
    .createTable("organization_commission", (table) => {
      table
        .uuid("id")
        .unique()
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .uuid("organization_id")
        .notNullable()
        .references("organizations.id");
      table.text("department_id").unique().notNullable();
      table.boolean("active").notNullable().defaultsTo(true);
      table.text("type").notNullable();
      table.decimal("commission_percentage").notNullable();
      table.unique(["organization_id", "department_id", "type"]);
      table.timestamps(true, true);
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger("organization_commission")));
};

exports.down = function (knex) {
  return knex.schema.dropTable("organization_commission");
};
