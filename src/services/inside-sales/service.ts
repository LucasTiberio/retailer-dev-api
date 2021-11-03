import { Transaction } from 'knex'
import MailService from '../mail/service'
import OrganizationService from '../organization/service'
import { BUCKET_URL, BUCKET_AFFILIATE_INSIDE_SALES_PIXEL_PATH } from '../../common/consts'
import { buildGetCategoriesThreeVtexUrl, buildGetProductsVtexUrl } from '../vtex/helpers'
import Axios from 'axios'
import common from '../../common'
import { Integrations } from '../integration/types'
import IntegrationService from '../integration/service'
import { getVtexProducts } from './vtex'


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

const getAllVtexProducts = async (
  input: {
    from: number,
    to: number
    search?: string,
    category?: string,
  },
  context: { secret: string; userServiceOrganizationRolesId: string; organizationId: string }) => {
  try {
    const decode: any = await common.jwtDecode(context.secret)
    const integration = await IntegrationService.getIntegrationByOrganizationId(context.organizationId)
    switch (integration.type) {
      case Integrations.VTEX:
        const products = await getVtexProducts(decode.accountName, input.from, input.to, input.search, input.category);
        const VtexProducts = {
          products,
          pageInfo: {
            hasNextPage: (input.to + input.from) < products.length
          }, 
        };

        return VtexProducts
         
      default:
        return []
    }

  }
  catch (error) {
    throw new Error(error.message)
  }
}

const getCategoriesVtex = async (context: { secret: string }) => {
  try {
    const decode: any = await common.jwtDecode(context.secret)
    const categories = await Axios.get(buildGetCategoriesThreeVtexUrl(decode.accountName))
    return categories.data
  }
  catch (error) {
    throw new Error(error.message)
  }
}

export default {
  sendAffiliateInsideSalesSpecialistMail,
  getAllVtexProducts,
  getCategoriesVtex
}
