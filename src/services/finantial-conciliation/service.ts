require('dotenv')
import { Transaction } from 'knex'
import OrganizationService from '../organization/service'
import ServicesTimeToPayRepository from './repository/organization_services_time_to_pay';

const handleOrganizationFinancialReconciliation = async (
  input: {
    close_day: number,
    payment_day: number,
    automatic_closure: boolean,
  },
  context: { organizationId: string },
  trx: Transaction
): Promise<boolean> => {
  try {
    const updateQuery = await ServicesTimeToPayRepository.updateFinantialConciliationByOrganizationId(context.organizationId, trx, input);
    if(updateQuery !== null) {
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(error.mesage);
  }
}

const getFinantialConciliationByOrganizationId = async (context: { organizationId: string}, trx: Transaction) => {
  try {
    const finantialConciliation = await ServicesTimeToPayRepository.getFinantialConciliationByOrganizationId(context.organizationId, trx);
    return finantialConciliation;
  } catch (error) {
    throw new Error(error.mesage);
  }
}

export default {
  handleOrganizationFinancialReconciliation,
  getFinantialConciliationByOrganizationId,
}
