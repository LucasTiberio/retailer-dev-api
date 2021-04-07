import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import removeUndefinedOfObjects from '../../../utils/removeUndefinedOfObjects'
import camelToSnakeCase from '../../../utils/camelToSnakeCase'
import { IWhiteLabelInfos } from '../types'
import { whiteLabelInfosAdapter } from '../adapter'

const getWhiteLabelInfosByOrganizationId = async (organizationId?: string, trx?: Transaction, domain?: String) => {
  let whiteLabelInfos
  if (domain) {
    whiteLabelInfos = await (trx || knexDatabase.knexConfig)('organization_white_label_customization AS owlc')
      .innerJoin('organizations AS o', 'o.id', 'owlc.organization_id')
      .where('custom_domain', domain)
      .select('owlc.primary_color', 'owlc.second_color', 'owlc.tertiary_color', 'owlc.logo', 'o.name', 'owlc.organization_id')
      .first()
  } else {
    whiteLabelInfos = await (trx || knexDatabase.knexConfig)('organization_white_label_customization').where('organization_id', organizationId).first().select()
  }

  return whiteLabelInfos ? whiteLabelInfosAdapter(whiteLabelInfos) : null
}

const sendWhiteLabelInfosByOrganizationId = async (input: IWhiteLabelInfos, organizationId: string, trx?: Transaction) => {
  removeUndefinedOfObjects(input)

  const inputAdapted = camelToSnakeCase(input)

  const whiteLabelInfos = await getWhiteLabelInfosByOrganizationId(organizationId, trx)

  if (whiteLabelInfos) {
    let [whiteLabelInfoUpdated] = await (trx || knexDatabase.knexConfig)('organization_white_label_customization').update(inputAdapted).where('organization_id', organizationId).returning('*')
    return whiteLabelInfosAdapter(whiteLabelInfoUpdated)
  } else {
    let [whiteLabelInfoCreated] = await (trx || knexDatabase.knexConfig)('organization_white_label_customization')
      .insert({ ...inputAdapted, organization_id: organizationId })
      .returning('*')
    return whiteLabelInfosAdapter(whiteLabelInfoCreated)
  }
}

export default {
  sendWhiteLabelInfosByOrganizationId,
  getWhiteLabelInfosByOrganizationId,
}
