exports.seed = async function(knex) {    
  return knex('service_roles').insert([{ name: "ADMIN" }, { name: "RESPONSIBLE" }, { name: "ANALYST" }]);
};