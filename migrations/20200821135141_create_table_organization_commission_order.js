const Knex = require("knex");
const knexfile = require("../knexfile");

exports.up = async (knex) => {
  await knex.schema.createTable("organization_commission_order", (table) => {
    table.uuid("id").unique().primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("organization_id").notNullable().references("organizations.id");
    table.integer("order").defaultTo(0);
    table.text("name").notNullable();
    table.timestamps(true, true);
  });
  await knex.raw(knexfile.onUpdateTrigger("organization_commission_order"));
};

exports.down = async (knex) => {
  return knex.schema.dropSchema("organization_commission_order");
};
