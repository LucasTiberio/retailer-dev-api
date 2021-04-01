import { Transaction } from 'knex'
import knexDatabase from '../../../knex-database'
import { usersOrganizationsAdapter } from '../adapters'
import { InviteStatus, ResponseStatus } from '../types'

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

export const memberHasInvite = async (affiliateId: string, organizationId: string, trx: Transaction): Promise<boolean> => {
  try {
    const [member] = await (trx || knexDatabase.knexConfig)('users_organizations')
    .where('organization_id', organizationId)
    .andWhere('user_id', affiliateId)
    .andWhere('invite_status', 'pendent')
    .whereNotNull('invite_hash');

    return !!member;
  } catch (error) {
    return false;
  }
}

export const cancelMemberInvite = async (affiliateId: string, organizationId: string, trx: Transaction): Promise<boolean> => {
  try {

    const [userOrganization] = await (trx || knexDatabase.knexConfig)('users_organizations')
      .where('organization_id', organizationId)
      .andWhere('user_id', affiliateId)
      .andWhere('invite_status', 'pendent')
      .whereNotNull('invite_hash');

      
    if (!userOrganization) throw new Error("user_organization_not_found")
      
    await (trx || knexDatabase.knexConfig)('users_organizations')
      .where('id', userOrganization.id)
      .update({
        invite_status: InviteStatus.refused,
        invite_hash: null,
        active: false,
      })

    return true;
  } catch (error) {
    return false;
  }
}