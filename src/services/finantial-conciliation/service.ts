require('dotenv')
import { Transaction } from 'knex'
import OrganizationService from '../organization/service'
import AffiliateHelper from './helpers'
import ServicesTimeToPayRepository from './repository/organization_services_time_to_pay'
import UsersOrganizationServiceRoleRepository from './repository/users_organization_service_roles'

const handleOrganizationFinantialConciliationConfiguration = async (
  input: {
    close_day: number
    payment_day: number
    automatic_closure: boolean
  },
  context: { organizationId: string },
  trx: Transaction
): Promise<boolean> => {
  try {
    const updateQuery = await ServicesTimeToPayRepository.updateFinantialConciliationByOrganizationId(context.organizationId, trx, input)
    if (updateQuery !== null) {
      return true
    }

    return false
  } catch (error) {
    throw new Error(error.mesage)
  }
}

const getFinantialConciliationConfigurationByOrganizationId = async (context: { organizationId: string }, trx: Transaction) => {
  try {
    const finantialConciliation = await ServicesTimeToPayRepository.getFinantialConciliationConfigurationByOrganizationId(context.organizationId, trx)
    return finantialConciliation
  } catch (error) {
    throw new Error(error.mesage)
  }
}

const getAffiliatesValuesByMonth = async (context: { organizationId: string; year_month: string }, trx: Transaction) => {
  try {
    const affiliateList = []
    const affiliates = await AffiliateHelper.getAffiliatesDict(context.organizationId, context.year_month);
    const affiliateIds = Object.keys(affiliates)
    const affiliatesBankData = await UsersOrganizationServiceRoleRepository.getBankDataByAffiliateIds(affiliateIds, trx)
    for (const affiliateId of affiliateIds) {
      let affiliateObj = {
        ...affiliates[affiliateId],
        name: null,
        document: null,
        agency: null,
        account: null,
        bank: null,
      }
      let bankData = affiliatesBankData.find((bd) => bd.affiliate_id === affiliateId)
      if (bankData) {
        affiliateObj.name = bankData.affiliate_name
        affiliateObj.document = bankData.document
        affiliateObj.agency = bankData.agency
        affiliateObj.account = `${bankData.account}-${bankData.account_digit}`
        affiliateObj.bank = `${bankData.bank_code} - ${bankData.bank_name}`
      }
      affiliateList.push(affiliateObj)
    }
    return {
      affiliates: affiliateList,
    }
  } catch (error) {
    throw new Error(error.mesage)
  }
}

export default {
  handleOrganizationFinantialConciliationConfiguration,
  getFinantialConciliationConfigurationByOrganizationId,
  getAffiliatesValuesByMonth,
}
