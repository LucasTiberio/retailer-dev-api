import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import OrganizationService from '../organization/service';
import ServicesService from '../services/service';
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE } from "../../common/consts";
import { OrganizationRoles } from "../organization/types";
import { organizationAdminMenu, organizationMemberMenu, affiliateMemberMountMenu } from './helpers';
import { ServiceRoles } from "../services/types";


const getMenuTree = async ( 
    context: { organizationId: string, client: IUserToken }, 
    trx: Transaction
  ) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  const userOrganization = await OrganizationService.getUserOrganizationByIds(context.client.id, context.organizationId, trx);

  if(!userOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

  const userOrganizationRole = await OrganizationService.getUserOrganizationRoleById(userOrganization.id, trx);

  const organizationRole = await OrganizationService.getOrganizationRoleById(userOrganizationRole.organizationRoleId, trx);

  if(organizationRole.name === OrganizationRoles.ADMIN){
    return organizationAdminMenu;
  }

  const userOrganizationService = await ServicesService.getUserInOrganizationService({userOrganizationId: userOrganization.id}, context, trx);

  if(organizationRole.name === OrganizationRoles.MEMBER && !userOrganizationService){
    return organizationMemberMenu
  }

  if(!userOrganizationService) throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE);

  const userOrganizationServiceRole = await ServicesService.getUserOrganizationServiceRoleById(userOrganizationService.id, trx);
      
  return affiliateMemberMountMenu(userOrganizationServiceRole.name)
}

export default {
  getMenuTree
}
