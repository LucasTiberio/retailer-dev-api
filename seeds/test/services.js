exports.seed = async function(knex) {    
    return knex('services').insert([{ name: "affiliate" }, { name: "teste" }]);
};