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
  const organizationAdminRole = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.ADMIN).first().select('id')
  const userOrganizationRolesMock = UserOrganizationRoleMock(userOrganizationMock.id, organizationAdminRole.id)
  const affiliateService = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).first().select('id')
  const organizationServiceMock = OrganizationServiceMock(organizationMock.id, affiliateService.id)
  const analystServiceRoles = await (trx || knexDatabase.knex)('service_roles').where('name', ServiceRoles.ANALYST).first().select('id')
  const userOrganizationServiceRoles = UserOrganizationServiceRolesMock(analystServiceRoles.id, affiliatUserOrganizationMock.id, organizationServiceMock.id)
  const integrationSecretMock = IntegrationSecretMock()
  const organizationIntegrationSecretMock = OrganizationIntegrationSecretMock(integrationSecretMock.id, organizationMock.id)

  await (trx || knexDatabase.knex)('users').insert({ ...adminUserMock })
  const [affiliateUser] = await (trx || knexDatabase.knex)('users')
    .insert({ ...affiliateUserMock })
    .returning('*')
  await (trx || knexDatabase.knex)('organization_additional_infos').insert({ ...organizationAdditionalInfosMock })
  const [organization] = await (trx || knexDatabase.knex)('organizations')
    .insert({ ...organizationMock })
    .returning('*')
  await (trx || knexDatabase.knex)('users_organizations').insert({ ...userOrganizationMock })
  await (trx || knexDatabase.knex)('users_organizations').insert({ ...affiliatUserOrganizationMock })
  await (trx || knexDatabase.knex)('users_organization_roles').insert({
    ...userOrganizationRolesMock,
  })
  await (trx || knexDatabase.knex)('organization_services').insert({ ...organizationServiceMock })
  const [affiliate] = await (trx || knexDatabase.knex)('users_organization_service_roles')
    .insert({ ...userOrganizationServiceRoles })
    .returning('*')
  await (trx || knexDatabase.knex)('integration_secrets').insert({ ...integrationSecretMock })
  await (trx || knexDatabase.knex)('organization_integration_secrets').insert({ ...organizationIntegrationSecretMock })

  return {
    affiliate,
    affiliateUser,
    organization,
  }
}

export default createAffiliateMock
