import { IServiceAdaptedFromDB, ServiceRoles, Services } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import OrganizationRulesService from '../organization-rules/service';
import OrganizationService from '../organization/service';
import BankDataService from '../bank-data/service';
import VtexService from '../vtex/service';
import knexDatabase from "../../knex-database";
import { OrganizationRoles } from "../organization/types";
import { MESSAGE_ERROR_UPGRADE_PLAN } from "../../common/consts";
import { IVtexIntegrationAdapted } from "../vtex/types";
import { organizationServicesRolesByIdLoader, organizationServicesByOrganizationIdLoader, organizationServicesRolesByIdOneToOneLoader, userOrganizationServicesByIdLoader, userOrganizationServicesHasLinkGeneratedByIdLoader } from "./loaders";
import { _serviceAdapter, _serviceRolesAdapter, _usersOrganizationServiceAdapter } from './adapters';


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

const getServiceRolesByName = async (serviceRoleName: ServiceRoles | string, trx?: Transaction) => {
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

const usersInServiceOrganizationCount = async (serviceRoleId: string, serviceOrganizationId: string, emails: string[] ,trx: Transaction) => {

  const [usersInServiceOrganizationCounted] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users AS u', 'u.id', 'uo.user_id')
    .where('uosr.service_roles_id', serviceRoleId)
    .andWhere('uosr.organization_services_id', serviceOrganizationId)
    .andWhere('uosr.active', true)
    .whereNotIn('u.email', emails)
    .count();

  return usersInServiceOrganizationCounted.count;

}

const _usersInServiceOrganizationCountById = async (serviceRoleId: string, serviceOrganizationId: string, userOrganizationServiceRoleId: string ,trx: Transaction) => {

  const [usersInServiceOrganizationCounted] = await (trx || knexDatabase.knex)('users_organization_service_roles')
    .where('service_roles_id', serviceRoleId)
    .andWhere('organization_services_id', serviceOrganizationId)
    .andWhere('active', true)
    .andWhereNot('id', userOrganizationServiceRoleId)
    .count();

  return usersInServiceOrganizationCounted.count;

}

const verifyAffiliateMaxRules = async (
  users: {
    email: string
    role: ServiceRoles
  }[],
  affiliateRules: { maxAnalysts: number, maxSales: number },
  serviceOrganizationId: string,
  trx: Transaction
) => {

  let usersByRole : any = {};

  users.forEach(user => {
    let quantity = usersByRole[user.role]?.quantity || 0
    Object.assign(usersByRole, {[user.role] : {quantity: quantity+= 1, emails: usersByRole[user.role] ? [...usersByRole[user.role].emails, user.email] : [user.email] } })
  })

  await Promise.all(
    Object.keys(usersByRole).map(async role => {
      let usersToInvite = usersByRole[role];

      const affiliateService = await getServiceRolesByName(role, trx);

      const usersInServiceOrganizationCounted = await usersInServiceOrganizationCount(affiliateService.id, serviceOrganizationId, usersToInvite.emails ,trx);

      switch (role) {
        case ServiceRoles.ANALYST:
          if(usersToInvite.quantity > affiliateRules.maxAnalysts || (usersToInvite.quantity + Number(usersInServiceOrganizationCounted)) > affiliateRules.maxAnalysts) throw new Error(MESSAGE_ERROR_UPGRADE_PLAN);
          return;
        case ServiceRoles.SALE:
          if(usersToInvite.quantity > affiliateRules.maxSales || (usersToInvite.quantity + Number(usersInServiceOrganizationCounted)) > affiliateRules.maxSales) throw new Error(MESSAGE_ERROR_UPGRADE_PLAN);
          return 
        default: return null;
      }
  
    })
  )
 
}
const _verifyAffiliateMaxRulesByUserOrganizationServiceId = async (
  user: {
    serviceOrganizationId: string,
    role: ServiceRoles,
    userOrganizationServiceRoleId: string
  },
  affiliateRules: { maxAnalysts: number, maxSales: number },
  trx: Transaction
) => {

  const { serviceOrganizationId, role, userOrganizationServiceRoleId } = user

  const affiliateService = await getServiceRolesByName(role, trx);

  const usersInServiceOrganizationCounted = await _usersInServiceOrganizationCountById(affiliateService.id, serviceOrganizationId, userOrganizationServiceRoleId, trx);

  switch (role) {
    case ServiceRoles.ANALYST:
      if(1 > affiliateRules.maxAnalysts || (1 + Number(usersInServiceOrganizationCounted)) > affiliateRules.maxAnalysts) throw new Error(MESSAGE_ERROR_UPGRADE_PLAN);
      return;
    case ServiceRoles.SALE:
      if(1 > affiliateRules.maxSales || (1 + Number(usersInServiceOrganizationCounted)) > affiliateRules.maxSales) throw new Error(MESSAGE_ERROR_UPGRADE_PLAN);
      return 
    default: return null;
  }
  
}

const attachUserInOrganizationAffiliateService = async (
    input : { userOrganizationId : string, role: ServiceRoles, organizationId: string, serviceOrganization: {
      id: string,
      service_id: string
    } },
    trx: Transaction,
    vtexSecrets?: IVtexIntegrationAdapted
  ) => {

  const { userOrganizationId, role, organizationId } = input;

    const [serviceRoleSelected] = await (trx || knexDatabase.knex)('service_roles').where('name', role).select('id');

    if(!serviceRoleSelected)
      throw new Error('Service role doesnt exist');

    const userOrganizationServiceRoleFound = await getUserOrganizationServiceRole(userOrganizationId, input.serviceOrganization.id, trx);

    if(userOrganizationServiceRoleFound){

      const [userReactiveInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').update({
        active: true,
        service_roles_id: serviceRoleSelected.id
      }).where({
        users_organization_id: userOrganizationId,
        organization_services_id: input.serviceOrganization.id
      }).returning('*');

      return ({..._usersOrganizationServiceAdapter(userReactiveInOrganizationService), serviceId: input.serviceOrganization.service_id});

    } else {

      const [userAddedInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles').insert({
        service_roles_id: serviceRoleSelected.id,
        users_organization_id: userOrganizationId,
        organization_services_id: input.serviceOrganization.id,
        active: true
      }).returning('*');
  
      if(vtexSecrets){
        await VtexService.createUserVtexCampaign(userAddedInOrganizationService.id, vtexSecrets, trx);
      }
  
      return ({..._usersOrganizationServiceAdapter(userAddedInOrganizationService), serviceId: input.serviceOrganization.service_id});
    }
  
}

const listAffiliatesMembers = async (
    input: {
      name?: string
      offset?: number
      limit?: number
    },
    context: { organizationId: string, client: IUserToken }, 
    trx: Transaction
  ) => {

  if(!context.client) throw new Error("token must be provided!");

  const [serviceOrganization] = await serviceOrganizationByName(context.organizationId, Services.AFFILIATE, trx);

  let query = (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('users_organizations AS uo', 'uo.id', 'uosr.users_organization_id')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
    .where('uosr.organization_services_id', serviceOrganization.id)
    .whereNot('uo.invite_status', 'refused')

    if(input && input.name) {
      query = query.andWhereRaw(`(LOWER(usr.email) LIKE ? OR LOWER(usr.username) LIKE ?)`, [`%${input.name.toLowerCase()}%`, `%${input.name.toLowerCase()}%`])
    }
  
    var [totalCount] = await query.clone().count();
  
    if(input && input.limit) {
      query = query.limit(input.limit)
    }
  
    if(input && input.offset) {
      query = query.offset(input.offset)
    }
  
    const result = await query.orderBy('usr.username', 'asc')
    .select('uosr.*')

    return {...totalCount, limit: input?.limit , offset: input?.offset ,affiliates: result.map(_usersOrganizationServiceAdapter)}

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

  return usersInOrganizationService ? _usersOrganizationServiceAdapter(usersInOrganizationService) : null;

}

const getUserOrganizationServiceByServiceName = async (input: {
  serviceName: Services
}, context: { client: IUserToken, userServiceOrganizationRolesId: string }, trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided!");

  const [usersInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .where('uosr.id', context.userServiceOrganizationRolesId)
    .select('uosr.*')

  return usersInOrganizationService ? _usersOrganizationServiceAdapter(usersInOrganizationService) : null;

}

const getUserInOrganizationServiceById = async (input: {
  userOrganizationServiceId: string
}, trx: Transaction) => {

  const [usersInOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .where('uosr.id', input.userOrganizationServiceId)
    .select('uosr.*')

  return usersInOrganizationService ? _usersOrganizationServiceAdapter(usersInOrganizationService) : null;

}

const isServiceAdmin = async (usersOrganizationId: string, serviceOrganizationId: string, trx: Transaction) => {

  const [organizationServiceRole] = await (trx || knexDatabase.knex)('users_organization_service_roles AS uosr')
    .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
    .where('uosr.users_organization_id', usersOrganizationId)
    .andWhere('uosr.organization_services_id', serviceOrganizationId)
    .select('sr.name');

  return organizationServiceRole.name === ServiceRoles.ADMIN
}

const handleServiceMembersRole = async (input : {
  serviceName: Services,
  serviceRole: ServiceRoles,
  userOrganizationServiceRoleId: string
}, context: { client: IUserToken, organizationId: string }, trx: Transaction) => {

  const { serviceName , serviceRole, userOrganizationServiceRoleId } = input;

  const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId);

  const serviceRoleFound = await getServiceRolesByName(input.serviceRole, trx);

  const [serviceOrganizationFound] = await serviceOrganizationByName(context.organizationId, serviceName, trx);

  if(!serviceOrganizationFound)
    throw new Error("Organization doesnt have this service");

  await _verifyAffiliateMaxRulesByUserOrganizationServiceId({
    role: serviceRole,
    serviceOrganizationId: serviceOrganizationFound.id,
    userOrganizationServiceRoleId
  }, affiliateTeammateRules, trx);

  const [userOrganizationServiceRoleUpdated] = await (trx || knexDatabase.knex)('users_organization_service_roles').update({
    service_roles_id: serviceRoleFound.id,
  }).where(
    'id', userOrganizationServiceRoleId
  ).returning('*');

  return {..._usersOrganizationServiceAdapter(userOrganizationServiceRoleUpdated), serviceId: serviceOrganizationFound.service_id};

}

const getServiceMemberById = async (userOrganizationId: string, organizationServiceId: string , trx: Transaction) => {

  const [userOrganizationService] = await (trx || knexDatabase.knex)('users_organization_service_roles')
    .where(
    'users_organization_id',userOrganizationId
  ).andWhere(
    'organization_services_id', organizationServiceId
  ).returning('*');

  return userOrganizationService ? _usersOrganizationServiceAdapter(userOrganizationService) : null

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

const getUserInOrganizationServiceByUserOrganizationId = async (input: {usersOrganizationId: string, activity?: boolean}, trx: Transaction) => {

  let query = (trx || knexDatabase.knex)('users_organization_service_roles')
    .where('users_organization_id', input.usersOrganizationId)

  if(input.activity !== undefined){
    query = query.andWhere('active', input.activity);
  }
  
  return await query.select('*');

}

const getOrganizationServicesByOrganization = async (organizationId: string, trx: Transaction) => {

  const organizationService = await (trx || knexDatabase.knex)('organization_services')
    .where('organization_id', organizationId)
    .select();

  return organizationService

}

const inativeServiceMembersById = async (userOrganizationServiceIds: string[], trx: Transaction) => {
  await (trx || knexDatabase.knex)('users_organization_service_roles')
    .update({
      active: false
    }).whereIn('id', userOrganizationServiceIds)
}

const getOrganizationServiceByServiceName = async (input: {
  service: Services
  organizationId: string
}, trx: Transaction) => {

  const serviceFound = await getServiceByName(input.service, trx);

  const [organizationService] = await (trx|| knexDatabase.knex)('organization_services')
    .where('service_id', serviceFound.id)
    .andWhere("organization_id", input.organizationId)
    .select();

  return organizationService;

}

export default {
  getOrganizationServiceByServiceName,
  inativeServiceMembersById,
  createServiceInOrganization,
  getUserInOrganizationServiceByUserOrganizationId,
  getOrganizationServicesById,
  getOrganizationServicesByOrganization,
  getOrganizationServicesByOrganizationId,
  getUserOrganizationServiceRoleById,
  serviceOrganizationByName,
  getServiceRolesByName,
  handleServiceMembersRole,
  // listUsersInOrganizationService,
  listUsedServices,
  verifyFirstSteps,
  getServiceRolesByOneId,
  getServiceMemberById,
  getUserOrganizationServiceRoleName,
  getServiceById,
  getUserInOrganizationServiceById,
  getUserOrganizationServiceByServiceName,
  getUserOrganizationServiceRole,
  getServiceRolesById,
  getUserInOrganizationService,
  getServiceByName,
  _usersOrganizationServiceAdapter,
  getOrganizationIdByUserOrganizationServiceRoleId,
  attachUserInOrganizationAffiliateService,
  verifyAffiliateMaxRules,
  listAffiliatesMembers
}
