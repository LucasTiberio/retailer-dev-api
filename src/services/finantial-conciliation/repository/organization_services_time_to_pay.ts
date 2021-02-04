import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import removeUndefinedOfObjects from '../../../utils/removeUndefinedOfObjects'
import ServiceServices from '../../services/service'
import { Services } from '../../services/types'

const getFinantialConciliationConfigurationByOrganizationId = async (organizationId: string, trx: Transaction) => {
  const organizationCommission = await (trx || knexDatabase.knexConfig)('organization_services_time_to_pay as osttp')
    .rightJoin('organization_services as oss', 'osttp.organization_service_id', 'oss.id')
    .where('oss.organization_id', organizationId)
    .select('osttp.close_day', 'osttp.payment_day', 'osttp.automatic_closure', 'osttp.organization_service_id', 'oss.organization_id')
    .first()

  return organizationCommission
}

interface FinantialConciliationUpdateI {
  close_day?: number
  payment_day?: number
  automatic_closure?: boolean
}
const updateFinantialConciliationByOrganizationId = async (organizationId: string, trx: Transaction, updates: FinantialConciliationUpdateI) => {
  let update: any = {
    close_day: updates.close_day ?? undefined,
    payment_day: updates.payment_day ?? undefined,
    automatic_closure: updates.automatic_closure,
  }

  removeUndefinedOfObjects(update)

  try {
    const organizationService = await ServiceServices.getOrganizationServiceByServiceName({ service: Services.AFFILIATE, organizationId: organizationId }, trx)

    const organizationServicesTimeToPay = await (trx || knexDatabase.knexConfig)('organization_services_time_to_pay').where('organization_service_id', organizationService.id).select().first()

    if (organizationServicesTimeToPay) {
      return await (trx || knexDatabase.knexConfig)('organization_services_time_to_pay').where('id', organizationServicesTimeToPay.id).update(update)
    }

    await (trx || knexDatabase.knexConfig)('organization_services_time_to_pay').insert({ ...update, type: 'commission', days: 30, organization_service_id: organizationService.id })
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

export default {
  getFinantialConciliationConfigurationByOrganizationId,
  updateFinantialConciliationByOrganizationId,
}
