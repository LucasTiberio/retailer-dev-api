import { Transaction } from 'knex'
import { getPendingAndIsRequestedMembersByOrganizationId, handleMemberInviteStatus, cancelMemberInvite, memberHasInvite, getOrganizationsWaitingForApproval } from './repositories/users_organizations'
import { ResponseStatus } from './types'
import UserService from '../users/service'
import MadesaMailService from '../mail/madesa'
import GrowPowerMailService from '../mail/grow-power'
import OrganizationService from '../organization/service'
import MailService from '../mail/service'
import WhiteLabelService from '../white-label/service'
import { IncomingHttpHeaders } from 'http'
import { MADESA_WHITE_LABEL_DOMAIN } from '../../common/consts'
import { GROW_POWER_WHITE_LABEL_DOMAIN } from '../../common/consts'

const getPendingMembersByOrganizationId = async (
  context: {
    organizationId: string
  },
  trx: Transaction
) => {
  const members = await getPendingAndIsRequestedMembersByOrganizationId(context.organizationId, trx)

  return members
}

const deleteMemberInvitation = async (
  input: {
    userOrganizationId: string
  },
  organizationId: string,
  trx: Transaction
) => {
  const memberHasInvitation = await memberHasInvite(input.userOrganizationId, organizationId, trx)

  if (!memberHasInvitation) throw new Error('member_doesnt_have_invitation')

  try {
    await cancelMemberInvite(input.userOrganizationId, organizationId, trx)
    return true
  } catch (error) {
    return false
  }
}

const handleMemberInvitation = async (
  input: {
    inviteStatus: ResponseStatus
    userOrganizationId: string
  },
  context: {
    organizationId: string,
    headers: IncomingHttpHeaders
  },
  trx: Transaction
) => {
  const memberUpdated = await handleMemberInviteStatus(input, context.organizationId, trx)

  const member = await UserService.getUserById(memberUpdated.user_id, trx)

  const organization = await OrganizationService.getOrganizationById(context.organizationId, trx)

  let HEADER_HOST = (context.headers.origin || '').split('//')[1].split(':')[0]

  if (input.inviteStatus === ResponseStatus.accept) {
    const whiteLabelInfo = await WhiteLabelService.getWhiteLabelInfosDomain(context, trx)

    if (member.encrypted_password && member.username) {
      await MailService.sendInviteUserMail({
        email: member.email,
        hashToVerify: memberUpdated.invite_hash,
        organizationName: organization.name,
        whiteLabelInfo
      })
    } else {

      if (MADESA_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
        await MadesaMailService.sendInviteNewUserMail({
          email: member.email,
          hashToVerify: memberUpdated.invite_hash,
          organizationName: organization.name,
        })
      } else if (GROW_POWER_WHITE_LABEL_DOMAIN.includes(HEADER_HOST)) {
        await GrowPowerMailService.sendInviteNewUserMail({
          email: member.email,
          hashToVerify: memberUpdated.invite_hash,
          organizationName: organization.name,
          whiteLabelInfo
        })
      } else {
        await MailService.sendInviteNewUserMail({
          email: member.email,
          hashToVerify: memberUpdated.invite_hash,
          organizationName: organization.name,
          whiteLabelInfo
        })
      }

    }
  }

  return memberUpdated
}

const getOrganizationsWaitingForAdminApproval = (userId: string, trx: Transaction) => {
  return getOrganizationsWaitingForApproval(userId, trx)
}

export default {
  getPendingMembersByOrganizationId,
  getOrganizationsWaitingForAdminApproval,
  handleMemberInvitation,
  deleteMemberInvitation,
}
