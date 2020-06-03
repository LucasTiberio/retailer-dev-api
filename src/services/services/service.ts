import { IServiceAdaptedFromDB, ServiceRoles, Services, IUsersOrganizationServiceDB, IServiceRolesDB, IListAvailableUsersToServicePayload, ISimpleOrganizationServicePayload, IServiceAdapted } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import OrganizationService from '../organization/service';
import VtexService from '../vtex/service';
import knexDatabase from "../../knex-database";
import { OrganizationInviteStatus, OrganizationRoles } from "../organization/types";
import store from "../../store";

const _serviceAdapter = (record: IServiceAdaptedFromDB) => {
  return {
  id: record.id,
  name: record.name,
  active: record.active,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  hasOrganization: !!record.has_organization,
  serviceRolesId: record.service_roles_id
}};

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
  updatedAt: record.updated_at,
  active: record.active
})

const organizationServicesByOrganizationIdLoader = store.registerOneToManyLoader(
  async (userOrganizationIds : string[]) => {
    const query = await knexDatabase.knex('users_organization_service_roles AS uosr')
    .innerJoin('organization_services AS os', 'os.id', 'uosr.organization_services_id')
    .innerJoin('services AS serv', 'serv.id', 'os.service_id')
    .whereIn('uosr.users_organization_id', userOrganizationIds)
    .select('serv.*', 'uosr.service_roles_id', 'uosr.users_organization_id');
    return query;
  },
    'users_organization_id',
    _serviceAdapter
);

const organizationServicesRolesByIdLoader = store.registerOneToManyLoader(
  async (serviceRolesId : string[]) => {
    const query = await knexDatabase.knex('service_roles')
    .whereIn('id', serviceRolesId)
    .select();
    return query;
  },
    'id',
    _serviceRolesAdapter
);

const organizationServicesRolesByIdOneToOneLoader = store.registerOneToOneLoader(
  async (serviceRolesId : string[]) => {
    const query = await knexDatabase.knex('service_roles')
    .whereIn('id', serviceRolesId)
    .select();
    return query;
  },
    'id',
    _serviceRolesAdapter
);

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

const getServiceRolesById = async (serviceRolesId: string) => {

  const organizationServices = await organizationServicesRolesByIdLoader().load(serviceRolesId);

  return organizationServices;
}

const getServiceRolesByOneId = async (serviceRolesId: string) => {

  const organizationServices = await organizationServicesRolesByIdOneToOneLoader().load(serviceRolesId);

  return organizationServices;
}

const getServiceRolesByName = async (serviceRoleName: ServiceRoles, trx?: Transaction) => {
  const [serviceRolesFound] = await (trx || knexDatabase.knex)('service_roles').where('name', serviceRoleName).select();
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

const getUserOrganizationServiceRole = async (usersOrganizationId: string, serviceOrganizationId: string, trx: Transaction) => {

  const [userReactiveInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles')
  .where('users_organization_id', usersOrganizationId)
  .andWhere('organization_services_id', serviceOrganizationId)
  .select();

  return userReactiveInOrganizationService;

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

  const vtexSecrests = await VtexService.getSecretsByOrganizationId(organizationId, trx);

  if(!vtexSecrests || !vtexSecrests.status) throw new Error("Vtex Integration not implemented");

  const [serviceOrganizationFound] = await serviceOrganizationByName(organizationId, serviceName, trx);

  const userOrganizationServiceRoleFound = await getUserOrganizationServiceRole(usersOrganizationFoundDb.id, serviceOrganizationFound.id, trx);

  if(userOrganizationServiceRoleFound){

    const [userReactiveInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').update({
      active: true
    }).where({
      users_organization_id: usersOrganizationFoundDb.id,
      organization_services_id: serviceOrganizationFound.id
    }).returning('*');

    return {...usersOrganizationServiceAdapter(userReactiveInOrganizationService), serviceId: serviceOrganizationFound.service_id};

  }

  const [userAddedInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').insert({
    service_roles_id: serviceAnalystServiceRole.id,
    users_organization_id: usersOrganizationFoundDb.id,
    organization_services_id: serviceOrganizationFound.id
  }).returning('*');

  const vtexCampaignCreated = await VtexService.createUserVtexCampaign(userAddedInOrganizationService.id, vtexSecrests, trx);

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
       INNER JOIN users_organization_roles AS uor
          ON uor.users_organization_id = uo.id
        LEFT JOIN users_organization_service_roles AS uosr
             ON uosr.users_organization_id = uo.id
       LEFT JOIN organization_services AS os
          ON os.id = uosr.organization_services_id
          AND os.id = '${serviceOrganizationFound.id}'
        WHERE uor.organization_role_id <> '${organizationRole.id}'
      AND uo.organization_id = '${organizationId}'
      AND uosr.id IS NULL
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

}

const isServiceAdmin = async (usersOrganizationId: string, serviceOrganizationId: string, trx: Transaction) => {

  const [organizationServiceRole] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
    .where('uosr.users_organization_id', usersOrganizationId)
    .andWhere('uosr.organization_services_id', serviceOrganizationId)
    .select('sr.name');

  return organizationServiceRole.name === ServiceRoles.ADMIN
}

const userInServiceHandleRole = async (userInServiceHandleRolePayload : {
  organizationId: string,
  serviceName: Services,
  serviceRole: ServiceRoles,
  userId: string
}, userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided!");

  const { organizationId, serviceName , serviceRole, userId } = userInServiceHandleRolePayload;

  const [serviceOrganizationFound] = await serviceOrganizationByName(organizationId, serviceName, trx);

  if(!serviceOrganizationFound) throw new Error("Service organization not found!");

  const usersOrganizationFoundDb = await OrganizationService.getUserOrganizationByIds(userId, organizationId, trx);;

  if(!usersOrganizationFoundDb)
    throw new Error("User doesnt are in organization");

  if(
    !OrganizationService.isFounder(organizationId, userToken.id, trx) &&
    await isServiceAdmin(usersOrganizationFoundDb.id, serviceOrganizationFound.id, trx)
    ){
    throw new Error("Not auth to remove admin roles")
  }

  const [serviceRoleFound] = await (trx || knexDatabase.knex)('service_roles').where('name', serviceRole).select('id');

  if(!serviceRoleFound)
    throw new Error(`${serviceName} service role doesnt exist`);

  const [userOrganizationServiceRoleUpdated] = await (trx || knexDatabase.knex)('users_organization_service_roles').update({
    service_roles_id: serviceRoleFound.id,
  }).where(
    'users_organization_id',usersOrganizationFoundDb.id
  ).andWhere(
    'organization_services_id',serviceOrganizationFound.id
  ).returning('*');

  return {...usersOrganizationServiceAdapter(userOrganizationServiceRoleUpdated), serviceId: serviceOrganizationFound.service_id};

}

const inativeUserFromServiceOrganization = async (inativeUserFromServiceOrganizationPayload : {
  organizationId: string,
  serviceName: Services,
  userId: string
}, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided!");

  const { organizationId, serviceName , userId } = inativeUserFromServiceOrganizationPayload;

  const [serviceOrganizationFound] = await serviceOrganizationByName(organizationId, serviceName, trx);

  if(!serviceOrganizationFound) throw new Error("Service organization not found!");

  const usersOrganizationFoundDb = await OrganizationService.getUserOrganizationByIds(userId, organizationId, trx);;

  if(!usersOrganizationFoundDb) throw new Error("User doesnt are in organization");

  if(
    !OrganizationService.isFounder(organizationId, userToken.id, trx) &&
    await isServiceAdmin(usersOrganizationFoundDb.id, serviceOrganizationFound.id, trx)
    ){
    throw new Error("Not auth to remove admin roles")
  }

  const analystRole = await getServiceRolesByName(ServiceRoles.ANALYST, trx);

  const [userOrganizationServiceRoleUpdated] = await (trx || knexDatabase.knex)('users_organization_service_roles').update({
    active: false,
    service_roles_id: analystRole.id
  }).where(
    'users_organization_id',usersOrganizationFoundDb.id
  ).andWhere(
    'organization_services_id',serviceOrganizationFound.id
  ).returning('*');

  return {...usersOrganizationServiceAdapter(userOrganizationServiceRoleUpdated), serviceId: serviceOrganizationFound.service_id};

}

const getServiceMemberById = async (userOrganizationId: string, organizationServiceId: string , trx: Transaction) => {

  const [userOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles')
    .where(
    'users_organization_id',userOrganizationId
  ).andWhere(
    'organization_services_id', organizationServiceId
  ).returning('*');

  return userOrganizationService ? usersOrganizationServiceAdapter(userOrganizationService) : null

}

const getOrganizationServicesByOrganizationId = async (
  userOrganizationId: string,
  organizationId: string
  ) => {

  const [userOrganizationRole] = await OrganizationService.getUserOrganizationRole(userOrganizationId);

  const isAdmin = userOrganizationRole.name === OrganizationRoles.ADMIN;

  if(isAdmin){
    const allOrganizationServices = await knexDatabase.knex('organization_services AS os')
      .innerJoin('services AS serv', 'serv.id', 'os.service_id')
      .where('organization_id', organizationId)
      .select('serv.*');
    const serviceAdminRole = await getServiceRolesByName(ServiceRoles.ADMIN);
    return allOrganizationServices.map((item : IServiceAdaptedFromDB) => _serviceAdapter({...item, service_roles_id: serviceAdminRole.id}))
  }

  const organizationServices = await organizationServicesByOrganizationIdLoader().load(userOrganizationId);

  return organizationServices;

}

export default {
  createServiceInOrganization,
  listAvailableUsersToService,
  getOrganizationServicesByOrganizationId,
  serviceOrganizationByName,
  inativeUserFromServiceOrganization,
  userInServiceHandleRole,
  listUsersInOrganizationService,
  listUsedServices,
  getServiceRolesByOneId,
  addUserInOrganizationService,
  getServiceMemberById,
  getServiceById,
  getServiceRolesById
}
