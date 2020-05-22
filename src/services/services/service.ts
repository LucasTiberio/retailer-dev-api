import { IServiceAdaptedFromDB, ServiceRoles, Services, IUsersOrganizationServiceDB, IServiceRolesDB, IListAvailableUsersToServicePayload, ISimpleOrganizationServicePayload } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import OrganizationService from '../organization/service';
import knexDatabase from "../../knex-database";
import { OrganizationInviteStatus, OrganizationRoles } from "../organization/types";

const _serviceAdapter = (record: IServiceAdaptedFromDB) => ({
  id: record.id,
  name: record.name,
  active: record.active,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  hasOrganization: !!record.has_organization
});

const _serviceRolesAdapter = (record: IServiceRolesDB) => ({
  id: record.id,
  name: record.name,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const usersOrganizationServiceAdapter = (record : IUsersOrganizationServiceDB) => ({
  id: record.id,
  serviceRolesId: record.service_roles_id,
  usersOrganizationId: record.users_organization_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at
})

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

const getServiceById = async (serviceId: string, trx?: Transaction) => {
  const [serviceFound] = await (trx || knexDatabase.knex)('services').where('id', serviceId).select();
  return _serviceAdapter(serviceFound);
}

const getServiceRolesById = async (serviceRolesId: string, trx?: Transaction) => {
  const [serviceRolesFound] = await (trx || knexDatabase.knex)('service_roles').where('id', serviceRolesId).select();
  return _serviceRolesAdapter(serviceRolesFound);
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

const serviceOrganizationByName = async (organizationId: string, serviceName: Services, trx: Transaction) => {
  return await (trx || knexDatabase.knex)('organization_services AS os')
    .innerJoin('services AS s', 's.id', 'os.service_id')
    .where('organization_id', organizationId)
      .andWhere('s.name', serviceName)
      .andWhere('s.active', true)
    .select('os.id', 's.id AS service_id')
}

const addUserInOrganizationService = async (attrs : { userId : string, organizationId : string, serviceName: Services }, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided!");

  const { userId, organizationId, serviceName } = attrs;

  const userOrganizationInviteStatus = await OrganizationService.userOrganizationInviteStatus(userId, organizationId, trx);

  if(userOrganizationInviteStatus.inviteStatus !== OrganizationInviteStatus.ACCEPT)
    throw new Error('Organization invite doesnt accepted by user.')

  const [serviceAnalystServiceRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

  if(!serviceAnalystServiceRole)
    throw new Error('Analyst service role doesnt exist');

  const [usersOrganizationFoundDb] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', userId).andWhere('organization_id', organizationId).select('id');

  if(!usersOrganizationFoundDb)
    throw new Error("User doesnt are in organization");

  const [serviceOrganizationFound] = await serviceOrganizationByName(organizationId, serviceName, trx);

  const [userAddedInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').insert({
    service_roles_id: serviceAnalystServiceRole.id,
    users_organization_id: usersOrganizationFoundDb.id,
    organization_services_id: serviceOrganizationFound.id
  }).returning('*');

  return {...usersOrganizationServiceAdapter(userAddedInOrganizationService), serviceId: serviceOrganizationFound.service_id};

}

const listAvailableUsersToService = async (listAvailableUsersToServicePayload : IListAvailableUsersToServicePayload, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided!");

  const { organizationId, serviceName } = listAvailableUsersToServicePayload;

  const [serviceOrganizationFound] = await serviceOrganizationByName(organizationId, serviceName, trx);

  const organizationRole = await OrganizationService.getOrganizationRoleId(OrganizationRoles.ADMIN, trx);

  const availableServices = await (trx || knexDatabase.knex).raw(
    `
    SELECT uo.id, uo.user_id, uo.organization_id
  FROM users_organizations AS uo
     LEFT JOIN users_organization_roles AS uor
     	ON uor.users_organization_id = uo.id
     LEFT JOIN users_organization_service_roles AS uosr
    	    ON uosr.users_organization_id = uo.id
			AND uosr.organization_services_id ='${serviceOrganizationFound.id}' 
	 LEFT JOIN organization_services AS os
 	 	ON os.id = uosr.organization_services_id
      WHERE uor.organization_role_id <> '${organizationRole.id}'
      AND uosr.ID IS NULL 
    `
  );

  return availableServices.rows.map((item : {id: string, user_id: string, organization_id: string}) => ({ id: item.id, userId: item.user_id, organizationId: item.organization_id }))

}

const listUsersInOrganizationService = async (listUsersInOrganizationServicePayload: {
  organizationId: string,
  serviceName: Services
}, userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided!");

  const { organizationId, serviceName } = listUsersInOrganizationServicePayload;

  const [serviceOrganization] = await serviceOrganizationByName(organizationId, serviceName, trx);

  const usersInOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
    .where('uosr.organization_services_id', serviceOrganization.id)
    .select('uosr.*')
    
  return usersInOrganizationService.map(usersOrganizationServiceAdapter)

};

export default {
  createServiceInOrganization,
  listAvailableUsersToService,
  serviceOrganizationByName,
  listUsersInOrganizationService,
  listUsedServices,
  addUserInOrganizationService,
  getServiceById,
  getServiceRolesById
}
