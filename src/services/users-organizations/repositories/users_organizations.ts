import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import { usersOrganizationsAdapter } from '../adapters'
import { ResponseStatus } from '../types'

export const getPendingAndIsRequestedMembersByOrganizationId = async (organizationId: string, trx: Transaction) => {
  const members = await (trx || knexDatabase.knexConfig)('users_organizations').where('organization_id', organizationId).andWhere('is_requested', true).andWhere('invite_status', 'pendent')

  return members.map(usersOrganizationsAdapter)
}

export const handleMemberInviteStatus = async (
  input: {
    inviteStatus: ResponseStatus
    userOrganizationId: string
  },
  organizationId: string,
  trx: Transaction
) => {
  const [memberUpdated] = await (trx || knexDatabase.knexConfig)('users_organizations')
    .where('organization_id', organizationId)
    .andWhere('id', input.userOrganizationId)
    .update({
      invite_status: input.inviteStatus,
    })
    .returning('*')

  return memberUpdated
}
