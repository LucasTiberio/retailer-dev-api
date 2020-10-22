exports.up = function (knex) {
    return knex.schema.alterTable('organizations', (table) => {
        table.text('free_plan')
    })
}

exports.down = function (knex) {
    return knex.schema.alterTable('organizations', (table) => {
        table.dropColumn('free_plan')
    })
}
