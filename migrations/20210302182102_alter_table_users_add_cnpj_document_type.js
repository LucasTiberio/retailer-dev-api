exports.up = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE "users" DROP CONSTRAINT "users_document_type_check";
    ALTER TABLE "users" ADD CONSTRAINT "users_document_type_check" CHECK (document_type IN ('cnpj'::text, 'cpf'::text, 'rg'::text))
  `);
};

// The reverse migration is similar
exports.down = function(knex, Promise) {
  return knex.schema.raw(`
    ALTER TABLE "users" DROP CONSTRAINT "users_document_type_check";
    ALTER TABLE "users" ADD CONSTRAINT "users_document_type_check" CHECK (document_type IN ('cpf'::text, 'rg'::text));
  `);
};