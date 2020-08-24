require('dotenv')
import { Transaction } from 'knex'
import MailService from '../mail/service'
import OrganizationService from '../organization/service';

const sendAffiliateInsideSalesSpecialistMail = async (
  input: {
    email: string
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const organization = await OrganizationService.getOrganizationById(context.organizationId, trx);
  if (!organization) throw new Error('Organization not found.')

  try {
    await MailService.sendHelpToSpecialist({
      email: input.email,
      organizationName: organization.name,
      domain: organization.domain,
      id: organization.id,
    })
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  sendAffiliateInsideSalesSpecialistMail,
}
