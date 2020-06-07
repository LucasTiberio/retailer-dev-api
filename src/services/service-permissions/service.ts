import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import knexDatabase from "../../knex-database";
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION, MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE } from '../../common/consts';
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import { IPermissionFromDB } from './types';
import { Services, ServiceRoles } from "../services/types";

const permissionAdapter = (record: IPermissionFromDB) => ({
  id: record.id,
  serviceRoleName: record.service_role_name,
  permissionName: record.permission_name,
  grant: record.grant,
  serviceId: record.service_id
});

const userServicePermissions = async (input: { name?: string, serviceName: Services },context: { isOrganizationAdmin?: boolean, organizationId: string, client: IUserToken }, trx : Transaction) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const service = await ServicesService.getServiceByName(input.serviceName, trx);

  let query;

  if(context.isOrganizationAdmin){

    const adminServiceRole = await ServicesService.getServiceRolesByName(ServiceRoles.ADMIN, trx);

    query  = (trx || knexDatabase.knex)('service_roles_permissions AS srp')
    .innerJoin('permissions AS perm', 'srp.permission_id', 'perm.id')
    .innerJoin('service_roles AS sr', 'sr.id', 'srp.service_role_id')
    .where('srp.service_role_id', adminServiceRole.id)
    .andWhere('srp.service_id', service.id);

  } else {

    const userOrganization = await OrganizationService.getUserOrganizationByIds(context.client.id, context.organizationId, trx);

    if(!userOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION)

    query  = (trx || knexDatabase.knex)('service_roles_permissions AS srp')
    .innerJoin('permissions AS perm', 'srp.permission_id', 'perm.id')
    .innerJoin('service_roles AS sr', 'sr.id', 'srp.service_role_id')
    .innerJoin('users_organization_service_roles AS uosr', 'uosr.service_roles_id', 'srp.service_role_id')
    .where('uosr.users_organization_id', userOrganization.id)
    .andWhere('srp.service_id', service.id);

  }

  if(input && input.name) {
    query = query.where('perm.name', input.name)
  }

  const result = await query.select('perm.name as permission_name', 'sr.name as service_role_name', 'srp.grant', 'perm.id', 'srp.service_id');

  return result.map(permissionAdapter);

}

export default {
  userServicePermissions
}
