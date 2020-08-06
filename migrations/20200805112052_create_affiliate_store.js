const Knex = require("knex");
const knexfile = require("../knexfile");

exports.up = async function (knex) {
  return knex.schema
    .createTable("affiliate_store", (table) => {
      table
        .uuid("id")
        .unique()
        .primary()
        .defaultTo(knex.raw("uuid_generate_v4()"));
      table
        .uuid("users_organization_service_roles_id")
        .notNullable()
        .references("users_organization_service_roles.id");
      table.text("avatar");
      table.text("cover");
      table.text("name");
      table.text("description");
      table.text("facebook");
      table.text("youtube");
      table.text("twitter");
      table.text("tiktok");
      table.text("instagram");
      table.timestamps(true, true);
    })
    .then(() => knex.raw(knexfile.onUpdateTrigger("affiliate_store")));
};

exports.down = function (knex) {
  return knex.schema.dropTable("affiliate_store");
};
