import { IUserToken } from "../authentication/types";
import { Transaction, QueryBuilder } from "knex";
import knexDatabase from "../../knex-database";
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION } from '../../common/consts';
import OrganizationService from '../organization/service';
import { IPermissionFromDB } from './types';

const permissionAdapter = (record: IPermissionFromDB) => ({
  id: record.id,
  organizationRoleName: record.organization_role_name,
  permissionName: record.permission_name,
  grant: record.grant,
});

const userOrganizationPermissions = async (input: { name?: string },context: { organizationId: string, client: IUserToken }, trx : Transaction) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const userOrganizationId = await OrganizationService.getUserOrganizationByIds(context.client.id, context.organizationId, trx);

  if(!userOrganizationId) throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION)

  let query  = (trx || knexDatabase.knexConfig)('organization_roles_permissions AS orp')
    .innerJoin('permissions AS perm', 'orp.permission_id', 'perm.id')
    .innerJoin('organization_roles AS or', 'or.id', 'orp.organization_role_id')
    .innerJoin('users_organization_roles AS uor', 'uor.organization_role_id', 'orp.organization_role_id')
    .where('uor.users_organization_id', userOrganizationId.id)

  if(input && input.name) {
    query = query.where('perm.name', input.name)
  }

  const result = await query.select('perm.name as permission_name', 'or.name as organization_role_name', 'orp.grant', 'perm.id');

  return result.map(permissionAdapter);

}

export default {
  userOrganizationPermissions
}
