exports.up = function (knex) {
    return knex.schema.alterTable('organization_white_label_customization', (table) => {
        table.text('personalized_terms_and_conditions')
    })
}

exports.down = function (knex) {
    return knex.schema.alterTable('organization_white_label_customization', (table) => {
        table.dropColumn('personalized_terms_and_conditions')
    })
}
