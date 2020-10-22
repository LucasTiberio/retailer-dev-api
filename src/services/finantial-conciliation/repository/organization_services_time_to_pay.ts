import knexDatabase from '../../../knex-database'
import { Transaction } from 'knex'
import removeUndefinedOfObjects from '../../../utils/removeUndefinedOfObjects'

const getFinantialConciliationByOrganizationId = async (organizationId: string, trx: Transaction) => {
  const organizationCommission = await (trx || knexDatabase.knexConfig)('organization_services_time_to_pay')
    .where('organization_id', organizationId)
    .first()
    .select("close_day", "payment_day", "automatic_closure")

  return organizationCommission;
}

interface FinantialConciliationUpdateI {
  close_day?: number;
  payment_day?: number;
  automatic_closure?: boolean;
}
const updateFinantialConciliationByOrganizationId = async (organizationId: string, trx: Transaction, updates: FinantialConciliationUpdateI) => {
  let update = {
    close_day: updates.close_day,
    payment_day: updates.payment_day,
    automatic_closure: updates.automatic_closure,
  };

  removeUndefinedOfObjects(update);

  await (trx || knexDatabase.knexConfig)('organization_services_time_to_pay')
    .update(update)
    .where('organization_id', organizationId)
}

export default {
  getFinantialConciliationByOrganizationId,
  updateFinantialConciliationByOrganizationId,
}
