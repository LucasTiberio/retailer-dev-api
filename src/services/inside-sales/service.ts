import { Transaction } from 'knex'
import MailService from '../mail/service'
import OrganizationService from '../organization/service'
import { BUCKET_URL, BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH } from '../../common/consts'

const sendAffiliateInsideSalesSpecialistMail = async (
  input: {
    email: string
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const organization = await OrganizationService.getOrganizationById(context.organizationId, trx)
  if (!organization) throw new Error('Organization not found.')

  try {
    await MailService.sendHelpToSpecialist(
      {
        email: input.email,
        organizationName: organization.name,
        id: organization.id,
      },
      BUCKET_URL,
      BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH
    )
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  sendAffiliateInsideSalesSpecialistMail,
}
