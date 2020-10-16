import {
  UserMock,
  OrganizationMock,
  UserOrganizationMock,
  UserOrganizationRoleMock,
  OrganizationServiceMock,
  OrganizationAdditionalInfosMock,
  OrganizationIntegrationSecretMock,
  IntegrationSecretMock,
} from '..'
import { OrganizationRoles } from '../../services/organization/types'
import { Services } from '../../services/services/types'
import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'

const createOrganizationMock = async (trx?: Transaction) => {
  const adminUserMock = UserMock()
  const organizationAdditionalInfosMock = OrganizationAdditionalInfosMock()
  const organizationMock = OrganizationMock(adminUserMock.id, organizationAdditionalInfosMock.id)
  const userOrganizationMock = UserOrganizationMock(adminUserMock.id, organizationMock.id)
  const organizationAdminRole = await (trx || knexDatabase.knexConfig)('organization_roles').where('name', OrganizationRoles.ADMIN).first().select('id')
  const userOrganizationRolesMock = UserOrganizationRoleMock(userOrganizationMock.id, organizationAdminRole.id)
  const affiliateService = await (trx || knexDatabase.knexConfig)('services').where('name', Services.AFFILIATE).first().select('id')
  const organizationServiceMock = OrganizationServiceMock(organizationMock.id, affiliateService.id)
  const integrationSecretMock = IntegrationSecretMock()
  const organizationIntegrationSecretMock = OrganizationIntegrationSecretMock(integrationSecretMock.id, organizationMock.id)

  await (trx || knexDatabase.knexConfig)('users').insert({ ...adminUserMock })
  await (trx || knexDatabase.knexConfig)('organization_additional_infos').insert({ ...organizationAdditionalInfosMock })
  const [organization] = await (trx || knexDatabase.knexConfig)('organizations')
    .insert({ ...organizationMock })
    .returning('*')
  await (trx || knexDatabase.knexConfig)('users_organizations').insert({ ...userOrganizationMock })
  await (trx || knexDatabase.knexConfig)('users_organization_roles').insert({
    ...userOrganizationRolesMock,
  })
  await (trx || knexDatabase.knexConfig)('organization_services').insert({ ...organizationServiceMock })
  await (trx || knexDatabase.knexConfig)('integration_secrets').insert({ ...integrationSecretMock })
  await (trx || knexDatabase.knexConfig)('organization_integration_secrets').insert({ ...organizationIntegrationSecretMock })

  return organization
}

export default createOrganizationMock
