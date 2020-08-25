require('dotenv')
import { Transaction } from 'knex'
import MailService from '../mail/service'
import OrganizationService from '../organization/service'
import { BUCKET_URL, BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH } from '../../common/consts'

const bucket = BUCKET_URL
const pixelPath = BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH

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
        domain: organization.domain,
        id: organization.id,
      },
      bucket,
      pixelPath
    )
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  sendAffiliateInsideSalesSpecialistMail,
}
