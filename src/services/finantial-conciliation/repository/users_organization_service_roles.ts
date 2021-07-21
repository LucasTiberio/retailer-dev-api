import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import plugFormRepository from '../../apps/repositories/plug-form-repository'

const getBankDataByAffiliateIds = async (ids: string[], trx: Transaction) => {
  const affiliatesBankData = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
    .whereIn('uosr.id', ids)
    .whereNot('uosr.bank_data_id', null)
    .innerJoin('banks_data as bd', 'bd.id', 'uosr.bank_data_id')
    .innerJoin('brazil_banks as bb', 'bd.brazil_bank_id', 'bb.id')
    .select('uosr.id as affiliate_id', 'bd.agency', 'bd.account', 'bd.account_digit', 'bd.document', 'bd.name as affiliate_name', 'bb.code as bank_code', 'bb.name as bank_name')

  return affiliatesBankData
}

const getAffiliateNameById = async (id: string, trx: Transaction) => {
  const affiliateNameAndEmail = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
    .where('uosr.id', id)
    .innerJoin('users_organizations as uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users as u', 'u.id', 'uo.user_id')
    .select('u.username', 'u.email')
    .first()

  return affiliateNameAndEmail.username ?? affiliateNameAndEmail.email
}

const getAffiliateNameAndDocumentById = async (id: string, trx: Transaction) => {
  const affiliateInfo = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
    .where('uosr.id', id)
    .innerJoin('users_organizations as uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users as u', 'u.id', 'uo.user_id')
    .innerJoin('banks_data as bd', 'bd.id', 'uosr.bank_data_id')
    .select('u.username', 'u.email', 'bd.document')
    .first()
  return { name: affiliateInfo.username ?? affiliateInfo.email, document: affiliateInfo.document }
}

const getAffiliateForm = async (input: { id: string, organizationId: string }, trx?: Transaction) => {
  const affiliateInfo = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
    .where('uosr.id', input.id)
    .innerJoin('users_organizations as uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users as u', 'u.id', 'uo.user_id')
    .select('u.id')
    .first()

    console.log({ affiliateInfo })

  if (affiliateInfo.id) {
    const form = await plugFormRepository.getPlugFormFields({
      userId: affiliateInfo.id,
      organizationId: input.organizationId,
    })

    console.log({ form })

    if (form) {
      const fieldsObj = form.fields.reduce((previous, { label, value }) => {
        return {
          ...previous,
          [label]: value
        }
      }, {})

      return fieldsObj
    }
  }

  return {}
}

const getAllAffiliates = async (organizationId: string, trx?: Transaction) => {
  const affiliates = await (trx || knexDatabase.knexConfig)('users_organization_service_roles as uosr')
  .where('uo.organization_id', organizationId)
  .innerJoin('users_organizations as uo', 'uo.id', 'uosr.users_organization_id')
  .innerJoin('users as u', 'u.id', 'uo.user_id')
  .select('uosr.id', 'u.username', 'u.email')
  
  console.log({affiliates})
  const affiliatesList = []

  if (affiliates.length) {
    for (const affiliate of affiliates) {
      const { id, ...rest } = affiliate
      const plugFormFields = await getAffiliateForm({
        id, organizationId
      }, trx)
      
      affiliatesList.push({ ...rest, ...plugFormFields })
    }

    return affiliatesList
  }

  return []
}

export default {
  getBankDataByAffiliateIds,
  getAffiliateNameById,
  getAffiliateNameAndDocumentById,
  getAffiliateForm,
  getAllAffiliates
}
