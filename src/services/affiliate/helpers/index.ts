import { IOrganizationCommission } from '../types'
import common from '../../../common'

/** Clients */

import ClientAffiliate from '../client'

/** Repositories */

import RepositoryServices from '../../services/repository/users_organization_service_roles'
import { Transaction } from 'knex'

const vtexUtmSource = 'plugone_affiliate'

export const generateVtexShortener = (originalUrl: string, hasQueryString: boolean, affiliateId: string, organizationId: string) => {
  const urlWithMemberAttached = `${originalUrl}${hasQueryString ? '&' : '?'}utm_source=${vtexUtmSource}&utm_campaign=${affiliateId}_${organizationId}`

  return urlWithMemberAttached
}

export const generateLojaIntegradaShortener = (originalUrl: string, hasQueryString: boolean, affiliateId: string, organizationId: string) => {
  const urlWithMemberAttached = `${originalUrl}${hasQueryString ? '&' : '?'}utm_campaign=plugone-affiliate_${affiliateId}_${organizationId}`

  return urlWithMemberAttached
}

export const attachVtexCategoryName = async (commissionList: IOrganizationCommission[], secret: string) => {
  const decode: any = await common.jwtDecode(secret)

  const vtexCategoriesData = await ClientAffiliate.getVtexCategoriesCategories(decode.accountName)

  let mergedArray: any = []

  vtexCategoriesData.map((item: { id: number; name: string }) => {
    return commissionList.some((commission) => {
      if (Number(item.id) === Number(commission.identifier_id)) {
        mergedArray.push({
          ...commission,
          name: item.name,
        })
      } else {
      }
    })
  })

  return mergedArray
}

export const attachVtexSubCategoryName = async (commissionList: IOrganizationCommission[], secret: string) => {
  const decode: any = await common.jwtDecode(secret)

  const vtexCategoriesData = await ClientAffiliate.getVtexCategoriesCategories(decode.accountName)

  const vtexSubCategories = vtexCategoriesData.reduce((acc: any, current: any) => {
    return acc.concat(current.children)
  }, [])

  let mergedArray: any = []

  vtexSubCategories.map((item: { id: number; name: string }) => {
    return commissionList.some((commission) => {
      if (Number(item.id) === Number(commission.identifier_id)) {
        mergedArray.push({
          ...commission,
          name: item.name,
        })
      }
    })
  })

  return mergedArray
}

export const attachAffiliateName = async (commissionList: IOrganizationCommission[], trx: Transaction) => {
  const affiliateIds = commissionList.map((item) => item.identifier_id)

  const affiliatesEmails = await RepositoryServices.getAffiliateEmailByIds(affiliateIds, trx)

  return commissionList.map((item) => {
    const affiliateEmail = affiliatesEmails.find((affiliateEmail) => affiliateEmail.id === item.identifier_id)
    return { ...item, name: affiliateEmail.email }
  })
}

export const attachSellerName = async (commissionList: IOrganizationCommission[]) => {
  return commissionList.map((item: { identifier_id: string }) => {
    return {
      ...item,
      name: item.identifier_id,
    }
  })
}

export const attachProductName = async (commissionList: IOrganizationCommission[], secret: string) => {
  const decode: any = await common.jwtDecode(secret)

  return await Promise.all(
    commissionList.map(async (commission) => {
      const vtexProductData = await ClientAffiliate.getVtexProductDataByProductId(decode, commission.identifier_id)

      return { ...commission, name: vtexProductData?.Name }
    })
  )
}
