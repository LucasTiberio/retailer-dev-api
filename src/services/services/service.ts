import { IServiceAdaptedFromDB } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import knexDatabase from "../../knex-database";

const _serviceAdapter = (record: IServiceAdaptedFromDB) => ({
  id: record.id,
  name: record.name,
  active: record.active,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  hasOrganization: !!record.has_organization
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

const listUsedServices = async (organizationCreatedId: string ,userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided!");

  const availableServices = await (trx || knexDatabase.knex).raw(
    `
    SELECT svc.*, os.organization_id = '${organizationCreatedId}' as has_organization
    FROM services AS svc
      LEFT JOIN organization_services AS os
      ON svc.id = os.service_id
        WHERE svc.active = true
    `
  );

  return availableServices.rows.map(_serviceAdapter);
}

export default {
  createServiceInOrganization,
  listUsedServices
}
