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
  const organizationAdminRole = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.ADMIN).first().select('id')
  const userOrganizationRolesMock = UserOrganizationRoleMock(userOrganizationMock.id, organizationAdminRole.id)
  const affiliateService = await (trx || knexDatabase.knex)('services').where('name', Services.AFFILIATE).first().select('id')
  const organizationServiceMock = OrganizationServiceMock(organizationMock.id, affiliateService.id)
  const integrationSecretMock = IntegrationSecretMock()
  const organizationIntegrationSecretMock = OrganizationIntegrationSecretMock(integrationSecretMock.id, organizationMock.id)

  await (trx || knexDatabase.knex)('users').insert({ ...adminUserMock })
  await (trx || knexDatabase.knex)('organization_additional_infos').insert({ ...organizationAdditionalInfosMock })
  const [organization] = await (trx || knexDatabase.knex)('organizations')
    .insert({ ...organizationMock })
    .returning('*')
  await (trx || knexDatabase.knex)('users_organizations').insert({ ...userOrganizationMock })
  await (trx || knexDatabase.knex)('users_organization_roles').insert({
    ...userOrganizationRolesMock,
  })
  await (trx || knexDatabase.knex)('organization_services').insert({ ...organizationServiceMock })
  await (trx || knexDatabase.knex)('integration_secrets').insert({ ...integrationSecretMock })
  await (trx || knexDatabase.knex)('organization_integration_secrets').insert({ ...organizationIntegrationSecretMock })

  return organization
}

export default createOrganizationMock
