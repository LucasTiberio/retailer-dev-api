exports.seed = async function(knex) {    
  return knex('organization_roles').insert([{ name: "ADMIN" }, { name: "MEMBER" }]);
};