import { Transaction } from 'knex'
import { getPendingAndIsRequestedMembersByOrganizationId, handleMemberInviteStatus } from './repositories/users_organizations'
import { ResponseStatus } from './types'
import UserService from '../users/service'
import OrganizationService from '../organization/service'
import MailService from '../mail/service'

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

  const member = await UserService.getUserById(memberUpdated.user_id, trx)

  const organization = await OrganizationService.getOrganizationById(context.organizationId, trx)

  if (input.inviteStatus === ResponseStatus.accept) {
    if (member.encrypted_password && member.username) {
      await MailService.sendInviteUserMail({
        email: member.email,
        hashToVerify: member.verification_hash,
        organizationName: organization.name,
      })
    } else {
      await MailService.sendInviteNewUserMail({
        email: member.email,
        hashToVerify: member.verification_hash,
        organizationName: organization.name,
      })
    }
  }

  return memberUpdated
}

export default {
  getPendingMembersByOrganizationId,
  handleMemberInvitation,
}
