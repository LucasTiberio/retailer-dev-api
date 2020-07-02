import { IServiceAdaptedFromDB, ServiceRoles, Services, IUsersOrganizationServiceDB, IServiceRolesDB, IListAvailableUsersToServicePayload, ISimpleOrganizationServicePayload, IServiceAdapted, ISimpleService } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import OrganizationService from '../organization/service';
import BankDataService from '../bank-data/service';
import VtexService from '../vtex/service';
import knexDatabase from "../../knex-database";
import { OrganizationInviteStatus, OrganizationRoles } from "../organization/types";
import store from "../../store";
import { MESSAGE_ERROR_CANNOT_ADD_ADMIN_TO_SERVICES } from "../../common/consts";

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
  active: record.active,
  bankDataId: record.bank_data_id
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

const userOrganizationServicesByIdLoader = store.registerOneToOneLoader(
  async (userOrganizationServiceIds : string[]) => {
    const query = await knexDatabase.knex('users_organization_service_roles')
    .whereIn('id', userOrganizationServiceIds)
    .select('*');
    return query;
  },
    'id',
    usersOrganizationServiceAdapter
);

const userOrganizationServicesHasLinkGeneratedByIdLoader = store.registerOneToOneLoader(
  async (userOrganizationServiceIds : string[]) => {
    const query = await knexDatabase.knex('users_organization_service_roles_url_shortener')
    .whereIn('users_organization_service_roles_id', userOrganizationServiceIds)
    .limit(1)
    .select('*');
    return query;
  },
    'users_organization_service_roles_id',
    (record: any) => record
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

const getServiceByName = async (serviceName: Services, trx: Transaction) => {

  const [serviceFound] = await (trx || knexDatabase.knex)('services').where('name', serviceName).select();
  return _serviceAdapter(serviceFound);

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

const listUsedServices = async (
    context : { client: IUserToken, organizationId: string }, 
    trx: Transaction
  ) => {

  if(!context.client) throw new Error("token must be provided!");

  const availableServices = await (trx || knexDatabase.knex).raw(
    `
    SELECT svc.*, os.organization_id = '${context.organizationId}' as has_organization
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

const getUserOrganizationServiceRoleName = async (usersOrganizationId: string, serviceOrganizationId: string, trx: Transaction) => {

  const [userOrganizationServiceRoleName] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
  .innerJoin('service_roles AS sr', 'uosr.service_roles_id', 'sr.id')
  .where('users_organization_id', usersOrganizationId)
  .andWhere('organization_services_id', serviceOrganizationId)
  .select('sr.*', 'uosr.id');

  return userOrganizationServiceRoleName;

}

const getUserOrganizationServiceRoleById = async (userOrganizationServiceRoleId: string, trx: Transaction) => {

  const [userReactiveInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
  .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
  .where('uosr.id', userOrganizationServiceRoleId)
  .select('sr.*');

  return _serviceRolesAdapter(userReactiveInOrganizationService);

}

const getOrganizationIdByUserOrganizationServiceRoleId = async (userOrganizationServiceRoleId: string, trx: Transaction) => {

  const [userReactiveInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
  .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
  .where('uosr.id', userOrganizationServiceRoleId)
  .select('uo.organization_id', 'uosr.organization_services_id');

  return {
    organizationId: userReactiveInOrganizationService.organization_id,
    organizationServiceId: userReactiveInOrganizationService.organization_services_id
  };

}

const addUserInOrganizationService = async (
    attrs : { userId : string, serviceName: Services }, 
    context: { organizationId: string, client: IUserToken }, 
    trx: Transaction
  ) => {

  if(!context.client) throw new Error("token must be provided!");

  const { userId, serviceName } = attrs;

  const [serviceAnalystServiceRole] = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).select('id');

  if(!serviceAnalystServiceRole)
    throw new Error('Analyst service role doesnt exist');

  const [usersOrganizationFoundDb] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', userId).andWhere('organization_id', context.organizationId).select('id');

  if(!usersOrganizationFoundDb)
    throw new Error("User doesnt are in organization");

  const usersOrganizationRoleIsAdmin = await OrganizationService.isOrganizationAdmin(usersOrganizationFoundDb.id, trx);

  if(usersOrganizationRoleIsAdmin) throw new Error(MESSAGE_ERROR_CANNOT_ADD_ADMIN_TO_SERVICES);

  const vtexSecrests = await VtexService.getSecretsByOrganizationId(context.organizationId, trx);

  if(!vtexSecrests || !vtexSecrests.status) throw new Error("Vtex Integration not implemented");

  const [serviceOrganizationFound] = await serviceOrganizationByName(context.organizationId, serviceName, trx);

  if(!serviceOrganizationFound) throw new Error("Organization doesnt have this service");

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

  await VtexService.createUserVtexCampaign(userAddedInOrganizationService.id, vtexSecrests, trx);

  return {...usersOrganizationServiceAdapter(userAddedInOrganizationService), serviceId: serviceOrganizationFound.service_id};

}

const attachUserInOrganizationServices = async (
    input : { userOrganizationId : string, services: ISimpleService[], organizationId: string },
    trx: Transaction
  ) => {

  const { userOrganizationId, services, organizationId } = input;

  const vtexSecrests = await VtexService.getSecretsByOrganizationId(organizationId, trx); if(!vtexSecrests || !vtexSecrests.status) 
    throw new Error("Vtex Integration not implemented");
  
  try {

    await Promise.all(services.map(async service => {

      const [serviceRoleSelected] = await (trx || knexDatabase.knex)('service_roles').where('name', service.role || ServiceRoles.ANALYST).select('id');

      if(!serviceRoleSelected) throw new Error('Service role doesnt exist');

      const [serviceOrganizationFound] = await serviceOrganizationByName(organizationId, service.name, trx);

      if(!serviceOrganizationFound) throw new Error("Organization doesnt have this service");

      const userOrganizationServiceRoleFound = await getUserOrganizationServiceRole(userOrganizationId, serviceOrganizationFound.id, trx);

      if(userOrganizationServiceRoleFound){

        const [userReactiveInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').update({
          active: true
        }).where({
          users_organization_id: userOrganizationId,
          organization_services_id: serviceOrganizationFound.id
        }).returning('*');

        return {...usersOrganizationServiceAdapter(userReactiveInOrganizationService), serviceId: serviceOrganizationFound.service_id};

      } else {

        const [userAddedInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').insert({
          service_roles_id: serviceRoleSelected.id,
          users_organization_id: userOrganizationId,
          organization_services_id: serviceOrganizationFound.id,
          active: true
        }).returning('*');
    
        if(service.name === Services.AFFILIATE){
          await VtexService.createUserVtexCampaign(userAddedInOrganizationService.id, vtexSecrests, trx);
        }
    
        return {...usersOrganizationServiceAdapter(userAddedInOrganizationService), serviceId: serviceOrganizationFound.service_id};
      }

      }))

  } catch (error){
    throw new Error(error.message);
  }

}

const listAvailableUsersToService = async (
  listAvailableUsersToServicePayload : IListAvailableUsersToServicePayload, 
  context: { organizationId: string, client: IUserToken }, 
  trx: Transaction
  ) => {

  if(!context.client) throw new Error("token must be provided!");

  const { serviceName } = listAvailableUsersToServicePayload;

  const [serviceOrganizationFound] = await serviceOrganizationByName(context.organizationId, serviceName, trx);

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
      AND uo.organization_id = '${context.organizationId}'
      AND uosr.id IS NULL
    `
  );

  return availableServices.rows.map((item : {id: string, user_id: string, organization_id: string}) => ({ id: item.id, userId: item.user_id, organizationId: item.organization_id }))

}

const listUsersInOrganizationService = async (listUsersInOrganizationServicePayload: {
  serviceName: Services
}, context: { organizationId: string, client: IUserToken }, trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided!");

  const { serviceName } = listUsersInOrganizationServicePayload;

  const [serviceOrganization] = await serviceOrganizationByName(context.organizationId, serviceName, trx);

  const usersInOrganizationService = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
    .where('uosr.organization_services_id', serviceOrganization.id)
    .select('uosr.*')
    
  return usersInOrganizationService.map(usersOrganizationServiceAdapter)

}

const getUserInOrganizationService = async (getUserInOrganizationServicePayload: {
  userOrganizationId: string
}, context: { client: IUserToken }, trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided!");

  const { userOrganizationId } = getUserInOrganizationServicePayload;

  const [usersInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
    .where('uosr.users_organization_id', userOrganizationId)
    .select('uosr.*')

  return usersInOrganizationService ? usersOrganizationServiceAdapter(usersInOrganizationService) : null;

}

const getUserOrganizationServiceByServiceName = async (input: {
  serviceName: Services
}, context: { client: IUserToken, userServiceOrganizationRolesId: string }, trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided!");

  const [usersInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .where('uosr.id', context.userServiceOrganizationRolesId)
    .select('uosr.*')

  return usersInOrganizationService ? usersOrganizationServiceAdapter(usersInOrganizationService) : null;

}

const getUserInOrganizationServiceById = async (input: {
  userOrganizationServiceId: string
}, trx: Transaction) => {

  const [usersInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .where('uosr.id', input.userOrganizationServiceId)
    .select('uosr.*')

  return usersInOrganizationService ? usersOrganizationServiceAdapter(usersInOrganizationService) : null;

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
  serviceName: Services,
  serviceRole: ServiceRoles,
  userId: string
}, context: { client: IUserToken, organizationId: string }, trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided!");

  const { serviceName , serviceRole, userId } = userInServiceHandleRolePayload;

  const [serviceOrganizationFound] = await serviceOrganizationByName(context.organizationId, serviceName, trx);

  if(!serviceOrganizationFound) throw new Error("Service organization not found!");

  const usersOrganizationFoundDb = await OrganizationService.getUserOrganizationByIds(userId, context.organizationId, trx);;

  if(!usersOrganizationFoundDb)
    throw new Error("User doesnt are in organization");

  if(
    !OrganizationService.isFounder(context.organizationId, context.client.id, trx) &&
    await isServiceAdmin(usersOrganizationFoundDb.id, serviceOrganizationFound.id, trx)
    ){
    throw new Error("Not auth to remove admin roles")
  }

  const [serviceRoleFound] = await (trx || knexDatabase.knex)('service_roles').where('name', serviceRole).select('id');

  if(!serviceRoleFound) throw new Error(`${serviceName} service role doesnt exist`);

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
  serviceName: Services,
  userId: string
}, context: { client: IUserToken, organizationId: string }, trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided!");

  const { serviceName , userId } = inativeUserFromServiceOrganizationPayload;

  const [serviceOrganizationFound] = await serviceOrganizationByName(context.organizationId, serviceName, trx);

  if(!serviceOrganizationFound) throw new Error("Service organization not found!");

  const usersOrganizationFoundDb = await OrganizationService.getUserOrganizationByIds(userId, context.organizationId, trx);;

  if(!usersOrganizationFoundDb) throw new Error("User doesnt are in organization");

  if(
    !OrganizationService.isFounder(context.organizationId, context.client.id, trx) &&
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

const getOrganizationServicesById = async (
  userOrganizationServiceId: string
  ) => {

  const organizationServices = await userOrganizationServicesByIdLoader().load(userOrganizationServiceId);

  return organizationServices;

}

const verifyFirstSteps = async (userServiceOrganizationId: string, bankDataId: string) => {

  const bankData = await BankDataService.getBankDataById(bankDataId);

  const hasLinkGenerated = await userOrganizationServicesHasLinkGeneratedByIdLoader().load(userServiceOrganizationId);

  return !(!!hasLinkGenerated && !!bankData);
}

export default {
  createServiceInOrganization,
  getOrganizationServicesById,
  // listAvailableUsersToService,
  getOrganizationServicesByOrganizationId,
  getUserOrganizationServiceRoleById,
  serviceOrganizationByName,
  getServiceRolesByName,
  // inativeUserFromServiceOrganization,
  userInServiceHandleRole,
  // listUsersInOrganizationService,
  listUsedServices,
  verifyFirstSteps,
  getServiceRolesByOneId,
  // addUserInOrganizationService,
  getServiceMemberById,
  getUserOrganizationServiceRoleName,
  getServiceById,
  getUserInOrganizationServiceById,
  getUserOrganizationServiceByServiceName,
  getUserOrganizationServiceRole,
  getServiceRolesById,
  getUserInOrganizationService,
  getServiceByName,
  usersOrganizationServiceAdapter,
  getOrganizationIdByUserOrganizationServiceRoleId,
  attachUserInOrganizationServices
}
