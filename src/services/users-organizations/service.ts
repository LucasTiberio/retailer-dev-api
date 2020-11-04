import { Transaction } from 'knex'
import { getPendingAndIsRequestedMembersByOrganizationId, handleMemberInviteStatus } from './repositories/users_organizations'
import { ResponseStatus } from './types'

const getPendingMembersByOrganizationId = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  const members = await getPendingAndIsRequestedMembersByOrganizationId(context.organizationId, trx)

  return members
}

const handleMemberInvitation = async (
  input: {
    inviteStatus: ResponseStatus
    userOrganizationId: string
  },
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  const memberUpdated = await handleMemberInviteStatus(input, context.organizationId, trx)

  return memberUpdated
}

export default {
  getPendingMembersByOrganizationId,
  handleMemberInvitation,
}
