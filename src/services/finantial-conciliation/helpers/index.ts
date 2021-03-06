import moment from 'moment'
import AffiliateOrders from '../model/AffiliateOrders'
import Bonifications from '../model/Bonifications'
import LojaIntegradaOrders from '../model/LojaIntegradaOrders'
import SaasCommissions from '../../saas-integration/models/SaasCommission'
import FinancialReconciliation, { FinancialReconciliationStatus } from '../model/FinancialReconciliation'
import { PlugOneAffiliateStatus, PlugoneSaasCommissionStatus } from '../types'

const getAffiliateOrdersDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const affiliateOrders = await AffiliateOrders.find({
    creationDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    plugoneAffiliateStatus: PlugOneAffiliateStatus.Approved,
    organizationId,
  })
  const affiliateDict = affiliateOrders.reduce((acc: any, cur: any) => {
    if (!acc[cur.affiliateInfo.affiliateId]) {
      acc[cur.affiliateInfo.affiliateId] = {
        affiliateId: cur.affiliateInfo.affiliateId,
        orders: 0,
        revenue: 0,
        commission: 0,
      }
    }
    acc[cur.affiliateInfo.affiliateId].orders++
    acc[cur.affiliateInfo.affiliateId].revenue += Number(cur.value)
    acc[cur.affiliateInfo.affiliateId].commission += cur.affiliateInfo.commission.amount
    return acc
  }, {})
  return affiliateDict
}

const getLojaIntegradaOrdersDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const lojaIntegradaOrders = await LojaIntegradaOrders.find({
    data_criacao: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    plugoneAffiliateStatus: PlugOneAffiliateStatus.Approved,
    externalId: organizationId,
  })
  const lojaIntegradaDict = lojaIntegradaOrders.reduce((acc: any, cur: any) => {
    if (!acc[cur.affiliateInfo.affiliateId]) {
      acc[cur.affiliateInfo.affiliateId] = {
        affiliateId: cur.affiliateInfo.affiliateId,
        orders: 0,
        revenue: 0,
        commission: 0,
      }
    }
    acc[cur.affiliateInfo.affiliateId].orders++
    acc[cur.affiliateInfo.affiliateId].revenue += Number(cur.valor_total)
    acc[cur.affiliateInfo.affiliateId].commission += cur.affiliateInfo.commission.amount
    return acc
  }, {})
  return lojaIntegradaDict
}

const getBonificationDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const bonifications = await Bonifications.find({
    createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    organizationId,
  })
  const bonificationDict = bonifications.reduce((acc: any, cur: any) => {
    if (!acc[cur.affiliateId]) {
      acc[cur.affiliateId] = {
        affiliateId: cur.affiliateId,
        orders: 0,
        revenue: 0,
        commission: 0,
      }
    }
    acc[cur.affiliateId].orders++
    acc[cur.affiliateId].revenue += cur.value
    acc[cur.affiliateId].commission += cur.value
    return acc
  }, {})
  return bonificationDict
}

const getSaasCommissionsDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const saasCommissions = await SaasCommissions.find({
    createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    organizationId,
    status: PlugoneSaasCommissionStatus.approved,
  })
  const saasCommissionsDict = saasCommissions.reduce((acc: any, cur: any) => {
    if (!acc[cur.affiliateId]) {
      acc[cur.affiliateId] = {
        affiliateId: cur.affiliateId,
        orders: 0,
        revenue: 0,
        commission: 0,
      }
    }
    acc[cur.affiliateId].orders++
    acc[cur.affiliateId].revenue += cur.value
    acc[cur.affiliateId].commission += cur.commission
    return acc
  }, {})
  return saasCommissionsDict
}

const mergeToAffiliatesDict = (dict: any, affiliatesDict: any): void => {
  for (const affiliateId of Object.keys(dict)) {
    if (!affiliatesDict[affiliateId]) {
      affiliatesDict[affiliateId] = {
        affiliateId,
        orders: 0,
        revenue: 0,
        commission: 0,
      }
    }
    affiliatesDict[affiliateId].orders += dict[affiliateId].orders
    affiliatesDict[affiliateId].revenue += dict[affiliateId].revenue
    affiliatesDict[affiliateId].commission += dict[affiliateId].commission
  }
  return affiliatesDict
}

const getAffiliatesDict = async (organizationId: string, yearMonth: string) => {
  let dict: any = {}

  dict = mergeToAffiliatesDict(await getAffiliateOrdersDict(organizationId, yearMonth), dict)
  dict = mergeToAffiliatesDict(await getLojaIntegradaOrdersDict(organizationId, yearMonth), dict)
  dict = mergeToAffiliatesDict(await getBonificationDict(organizationId, yearMonth), dict)
  dict = mergeToAffiliatesDict(await getSaasCommissionsDict(organizationId, yearMonth), dict)

  return dict
}

const getAffiliateOrdersDailyDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const affiliateOrders = await AffiliateOrders.find({
    creationDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    organizationId,
  })
  const affiliateOrdersDict = affiliateOrders.reduce((acc: any, cur: any) => {
    const day = moment(cur.creationDate).date()
    if (!acc[day]) {
      acc[day] = {
        revenue: 0,
        commission: 0,
      }
    }
    acc[day].revenue += Number(cur.value)
    acc[day].commission += cur.affiliateInfo.commission.amount
    return acc
  }, {})
  return affiliateOrdersDict
}

const getLojaIntegradaOrdersDailyDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const lojaIntegradaOrders = await LojaIntegradaOrders.find({
    data_criacao: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    externalId: organizationId,
    type: 'organization',
  })
  const lojaIntegradaDict = lojaIntegradaOrders.reduce((acc: any, cur: any) => {
    const day = moment(cur.data_criacao).date()
    if (!acc[day]) {
      acc[day] = {
        revenue: 0,
        commission: 0,
      }
    }
    acc[day].revenue += Number(cur.valor_total)
    acc[day].commission += cur.affiliateInfo.commission.amount
    return acc
  }, {})
  return lojaIntegradaDict
}

const getBonificationDailyDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const bonifications = await Bonifications.find({
    createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    organizationId,
  })
  const bonificationDict = bonifications.reduce((acc: any, cur: any) => {
    const day = moment(cur.createdAt).date()
    if (!acc[day]) {
      acc[day] = {
        revenue: 0,
        commission: 0,
      }
    }
    acc[day].revenue += cur.value
    acc[day].commission += cur.value
    return acc
  }, {})
  return bonificationDict
}

const getSaasCommissionsDailyDict = async (organizationId: string, yearMonth: string) => {
  const date = moment(yearMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()
  const saasCommissions = await SaasCommissions.find({
    createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    organizationId,
    status: PlugoneSaasCommissionStatus.approved,
  })
  const saasCommissionsDict = saasCommissions.reduce((acc: any, cur: any) => {
    const day = moment(cur.createdAt).date()
    if (!acc[day]) {
      acc[day] = {
        revenue: 0,
        commission: 0,
      }
    }
    acc[day].revenue += cur.value
    acc[day].commission += cur.commission
    return acc
  }, {})
  return saasCommissionsDict
}

const mergeToDailyDict = (dict: any, dailyDict: any): void => {
  for (const day of Object.keys(dict)) {
    if (!dailyDict[day]) {
      dailyDict[day] = {
        day,
        revenue: 0,
        commission: 0,
      }
    }
    dailyDict[day].revenue += dict[day].revenue
    dailyDict[day].commission += dict[day].commission
  }
  return dailyDict
}

const getDailyRevenueAndCommissions = async (organizationId: string, yearMonth: string) => {
  let dict: any = {}

  dict = mergeToDailyDict(await getAffiliateOrdersDailyDict(organizationId, yearMonth), dict)
  dict = mergeToDailyDict(await getLojaIntegradaOrdersDailyDict(organizationId, yearMonth), dict)
  dict = mergeToDailyDict(await getBonificationDailyDict(organizationId, yearMonth), dict)
  dict = mergeToDailyDict(await getSaasCommissionsDailyDict(organizationId, yearMonth), dict)

  const FinancialReconciliationFound = await FinancialReconciliation.findOne({ referenceMonth: yearMonth, organizationId }).select(['status', 'orders'])

  return {
    status: FinancialReconciliationFound?.status,
    days: Object.values(dict),
    orders: FinancialReconciliationFound?.orders,
  }
}

const advanceFinancialConciliationStatus = async (organizationId: string, referenceMonth: string) => {
  const financialReconciliationItem = await FinancialReconciliation.findOne({ referenceMonth, organizationId })
  if (!financialReconciliationItem) {
    throw new Error('financial_reconciliation_not_found')
  }
  const { status } = financialReconciliationItem
  let nextStatus: string
  switch (status) {
    case FinancialReconciliationStatus.OPEN:
      nextStatus = FinancialReconciliationStatus.CLOSED
      financialReconciliationItem.status = FinancialReconciliationStatus.CLOSED
      break
    case FinancialReconciliationStatus.CLOSED:
      nextStatus = FinancialReconciliationStatus.PAID
      financialReconciliationItem.status = FinancialReconciliationStatus.PAID
      await payAllOrders(referenceMonth, organizationId)
      break
    default:
      throw new Error('financial_reconciliation_cannot_advance')
  }

  await financialReconciliationItem.save()

  return nextStatus
}

const payAllOrders = async (referenceMonth: string, organizationId: string) => {
  const date = moment(referenceMonth, 'YYYY-MM').utc()
  const firstDayOfMonth = date.startOf('month').toISOString()
  const lastDayOfMonth = date.endOf('month').toISOString()

  await AffiliateOrders.update(
    {
      creationDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      organizationId,
    },
    {
      isPaid: true,
    }
  )

  await LojaIntegradaOrders.update(
    {
      data_criacao: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      externalId: organizationId,
      type: 'organization',
    },
    {
      isPaid: true,
    }
  )

  await Bonifications.update(
    {
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      organizationId,
    },
    {
      isPaid: true,
    }
  )
}

export default {
  getAffiliatesDict,
  getDailyRevenueAndCommissions,
  advanceFinancialConciliationStatus,
}
