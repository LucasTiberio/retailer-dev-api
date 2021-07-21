import { IUserToken } from '../authentication/types'
import { Transaction } from 'knex'
import OrganizationService from '../organization/service'
import ServicesService from '../services/service'
import IntegrationService from '../integration/service'
import AffiliateStoreApps from '../app-store/service'
import OrganizationRulesService from '../organization-rules/service'
import { MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE } from '../../common/consts'
import { OrganizationRoles } from '../organization/types'
import { organizationAdminMenu, organizationMemberMenu, affiliateMemberMountMenu } from './helpers'
import { IAffiliateStoreApp, InstalledAffiliateStoreApp } from '../app-store/types'

const getMenuTree = async (context: { organizationId: string; client: IUserToken; organizationSlug: string }, trx: Transaction) => {
  if (!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED)

  const userOrganization = await OrganizationService.getUserOrganizationByIds(context.client.id, context.organizationId, trx)

  if (!userOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE)

  const userOrganizationRole = await OrganizationService.getUserOrganizationRoleById(userOrganization.id, trx)

  const organizationRole = await OrganizationService.getOrganizationRoleById(userOrganizationRole.organizationRoleId, trx)

  const integration = await IntegrationService.getIntegrationByOrganizationId(context.organizationId, trx)

  const plan = await OrganizationRulesService.getPlanType(context.organizationId)

  if (organizationRole.name === OrganizationRoles.ADMIN) {
    
    return organizationAdminMenu(integration?.type, context.organizationId, context.organizationSlug, plan)
  }

  const userOrganizationService = await ServicesService.getUserInOrganizationService({ userOrganizationId: userOrganization.id }, context, trx)

  if (organizationRole.name === OrganizationRoles.MEMBER && (!userOrganizationService || !userOrganizationService.active)) {
    return organizationMemberMenu(context.organizationSlug)
  }

  if (!userOrganizationService) throw new Error(MESSAGE_ERROR_USER_NOT_EXISTS_IN_ORGANIZATION_SERIVCE)

  const userOrganizationServiceRole = await ServicesService.getUserOrganizationServiceRoleById(userOrganizationService.id, trx)

  const installedApps = await AffiliateStoreApps.getInstalledAffiliateStoreApps(context.organizationId)
  const appsDetails = await Promise.all(installedApps.map(app => AffiliateStoreApps.getAffiliateStoreApp({ id: app.affiliateStoreApp }, context.organizationId)))
  const installedAppsWithDetail = installedApps.map(installedApp => {
    const app = appsDetails.find(detail => detail.id.toString() === installedApp.affiliateStoreApp.toString()) as IAffiliateStoreApp | undefined

    return {
      installedApp,
      app
    }
  })

  return affiliateMemberMountMenu(userOrganizationServiceRole.name, integration?.type, context.organizationId, context.organizationSlug, installedAppsWithDetail)
}

export default {
  getMenuTree,
}
