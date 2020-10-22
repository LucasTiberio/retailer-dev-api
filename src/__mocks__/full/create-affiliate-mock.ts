import {
  UserMock,
  OrganizationMock,
  UserOrganizationMock,
  UserOrganizationRoleMock,
  OrganizationServiceMock,
  UserOrganizationServiceRolesMock,
  OrganizationAdditionalInfosMock,
  OrganizationIntegrationSecretMock,
  IntegrationSecretMock,
} from '..'
import { OrganizationRoles } from '../../services/organization/types'
import { Services, ServiceRoles } from '../../services/services/types'
import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'

const createAffiliateMock = async (trx?: Transaction) => {
  const adminUserMock = UserMock()
  const affiliateUserMock = UserMock()
  const organizationAdditionalInfosMock = OrganizationAdditionalInfosMock()
  const organizationMock = OrganizationMock(adminUserMock.id, organizationAdditionalInfosMock.id)
  const userOrganizationMock = UserOrganizationMock(adminUserMock.id, organizationMock.id)
  const affiliatUserOrganizationMock = UserOrganizationMock(affiliateUserMock.id, organizationMock.id)
  const organizationAdminRole = await (trx || knexDatabase.knexConfig)('organization_roles').where('name', OrganizationRoles.ADMIN).first().select('id')
  const userOrganizationRolesMock = UserOrganizationRoleMock(userOrganizationMock.id, organizationAdminRole.id)
  const affiliateService = await (trx || knexDatabase.knexConfig)('services').where('name', Services.AFFILIATE).first().select('id')
  const organizationServiceMock = OrganizationServiceMock(organizationMock.id, affiliateService.id)
  const analystServiceRoles = await (trx || knexDatabase.knexConfig)('service_roles').where('name', ServiceRoles.ANALYST).first().select('id')
  const userOrganizationServiceRoles = UserOrganizationServiceRolesMock(analystServiceRoles.id, affiliatUserOrganizationMock.id, organizationServiceMock.id)
  const integrationSecretMock = IntegrationSecretMock()
  const organizationIntegrationSecretMock = OrganizationIntegrationSecretMock(integrationSecretMock.id, organizationMock.id)

  await (trx || knexDatabase.knexConfig)('users').insert({ ...adminUserMock })
  const [affiliateUser] = await (trx || knexDatabase.knexConfig)('users')
    .insert({ ...affiliateUserMock })
    .returning('*')
  await (trx || knexDatabase.knexConfig)('organization_additional_infos').insert({ ...organizationAdditionalInfosMock })
  const [organization] = await (trx || knexDatabase.knexConfig)('organizations')
    .insert({ ...organizationMock })
    .returning('*')
  await (trx || knexDatabase.knexConfig)('users_organizations').insert({ ...userOrganizationMock })
  await (trx || knexDatabase.knexConfig)('users_organizations').insert({ ...affiliatUserOrganizationMock })
  await (trx || knexDatabase.knexConfig)('users_organization_roles').insert({
    ...userOrganizationRolesMock,
  })
  await (trx || knexDatabase.knexConfig)('organization_services').insert({ ...organizationServiceMock })
  const [affiliate] = await (trx || knexDatabase.knexConfig)('users_organization_service_roles')
    .insert({ ...userOrganizationServiceRoles })
    .returning('*')
  await (trx || knexDatabase.knexConfig)('integration_secrets').insert({ ...integrationSecretMock })
  await (trx || knexDatabase.knexConfig)('organization_integration_secrets').insert({ ...organizationIntegrationSecretMock })

  return {
    affiliate,
    affiliateUser,
    organization,
  }
}

export default createAffiliateMock
