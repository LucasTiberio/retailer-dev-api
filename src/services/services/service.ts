import { IServiceAdapted } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import knexDatabase from "../../knex-database";

const _serviceAdapter = (record: IServiceAdapted) => ({
  id: record.id,
  name: record.name,
  active: record.active,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const createServiceInOrganization = async (serviceId: string, organizationId: string, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("Token must be provided.");

  const serviceFound = await getServiceById(serviceId, trx);

  if(!serviceFound) throw new Error("Service not found.");

  try {

    await (trx || knexDatabase.knex)('organization_services').insert({
      organization_id: organizationId,
      service_id: serviceFound.id
    })

    return true;

  }catch(e){
    throw new Error(e.message)
  }

}

const getServiceById = async (serviceId: string, trx: Transaction) => {
  const [serviceFound] = await (trx || knexDatabase.knex)('services').where('id', serviceId).select();
  return _serviceAdapter(serviceFound);
}

export default {
  createServiceInOrganization
}
