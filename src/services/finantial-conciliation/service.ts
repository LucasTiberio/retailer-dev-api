require('dotenv')
import { Transaction } from 'knex'
import moment from 'moment'
import OrganizationService from '../organization/service'
import AffiliateHelper from './helpers'
import AffiliateOrders from './model/AffiliateOrders'
import Bonifications from './model/Bonifications'
import LojaIntegradaOrders from './model/LojaIntegradaOrders'
import SaasCommissions from '../saas-integration/models/SaasCommission'
import ServicesTimeToPayRepository from './repository/organization_services_time_to_pay'
import UsersOrganizationServiceRoleRepository from './repository/users_organization_service_roles'
import { PlugOneAffiliateStatus } from './types'

const handleOrganizationFinantialConciliationConfiguration = async (
  input: {
    close_day: number
    payment_day: number
    automatic_closure: boolean
  },
  context: { organizationId: string },
  trx: Transaction
): Promise<boolean> => {
  try {
    const updateQuery = await ServicesTimeToPayRepository.updateFinantialConciliationByOrganizationId(context.organizationId, trx, input)
    if (updateQuery !== null) {
      return true
    }

    return false
  } catch (error) {
    throw new Error(error.mesage)
  }
}

const getFinantialConciliationConfigurationByOrganizationId = async (context: { organizationId: string }, trx: Transaction) => {
  try {
    const finantialConciliation = await ServicesTimeToPayRepository.getFinantialConciliationConfigurationByOrganizationId(context.organizationId, trx)
    return finantialConciliation
  } catch (error) {
    throw new Error(error.mesage)
  }
}

const getAffiliatesValuesByMonth = async (context: { organizationId: string; year_month: string }, trx: Transaction) => {
  try {
    const affiliateList = []
    const affiliates = await AffiliateHelper.getAffiliatesDict(context.organizationId, context.year_month)
    const affiliateIds = Object.keys(affiliates)
    const affiliatesBankData = await UsersOrganizationServiceRoleRepository.getBankDataByAffiliateIds(affiliateIds, trx)
    for (const affiliateId of affiliateIds) {
      const plugFormFields = await UsersOrganizationServiceRoleRepository.getAffiliateForm({
        id: affiliateId,
        organizationId: context.organizationId
      }, trx)

      let affiliateObj = {
        ...affiliates[affiliateId],
        name: null,
        document: null,
        agency: null,
        account: null,
        bank: null,
        plugFormFields: JSON.stringify(plugFormFields),
      }
      let bankData = affiliatesBankData.find((bd) => bd.affiliate_id === affiliateId)
      if (bankData) {
        affiliateObj.name = bankData.affiliate_name
        affiliateObj.document = bankData.document
        affiliateObj.agency = bankData.agency
        affiliateObj.account = `${bankData.account}-${bankData.account_digit}`
        affiliateObj.bank = `${bankData.bank_code} - ${bankData.bank_name}`
      }
      affiliateList.push(affiliateObj)
    }
    return {
      affiliates: affiliateList,
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const getOrderListByAffiliateIdAndReferenceMonth = async (context: { organizationId: string; affiliateId: string; referenceMonth: string }, trx: Transaction) => {
  try {
    const date = moment(context.referenceMonth, 'YYYY-MM').utc()
    const firstDayOfMonth = date.startOf('month').toISOString()
    const lastDayOfMonth = date.endOf('month').toISOString()
    const clientNameAndDocument = await UsersOrganizationServiceRoleRepository.getAffiliateNameAndDocumentById(context.affiliateId, trx)

    const returnObj: any = {
      id: context.affiliateId,
      name: clientNameAndDocument.name,
      document: clientNameAndDocument.document,
      orders: 0,
      revenue: 0,
      commission: 0,
      orderList: [],
    }

    const affiliateOrders = await AffiliateOrders.find({
      creationDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      plugoneAffiliateStatus: PlugOneAffiliateStatus.Approved,
      organizationId: context.organizationId,
      'affiliateInfo.affiliateId': context.affiliateId,
    })

    affiliateOrders.forEach((order) => {
      returnObj.orders++
      returnObj.revenue += Number(order.value)
      returnObj.commission += order.affiliateInfo.commission?.amount ?? 0
      returnObj.orderList.push({
        id: order._id,
        client: `${order.clientProfileData?.firstName} ${order.clientProfileData?.lastName}`,
        date: moment(order.creationDate).format('DD/MM/YYYY - HH:mm:ss'),
        value: Number(order.value),
        commission: order.affiliateInfo.commission?.amount ?? 0,
        isPaid: order.isPaid,
      })
    })

    const lojaIntegradaOrders = await LojaIntegradaOrders.find({
      data_criacao: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      externalId: context.organizationId,
      plugoneAffiliateStatus: PlugOneAffiliateStatus.Approved,
      'affiliateInfo.affiliateId': context.affiliateId,
    })

    lojaIntegradaOrders.forEach((order) => {
      returnObj.orders++
      returnObj.revenue += Number(order.valor_total)
      returnObj.commission += order.affiliateInfo.commission?.amount ?? 0
      returnObj.orderList.push({
        id: order._id,
        client: order.cliente.nome,
        date: moment(order.data_criacao).format('DD/MM/YYYY - HH:mm:ss'),
        value: order.valor_total,
        commission: order.affiliateInfo.commission?.amount ?? 0,
        isPaid: order.isPaid,
      })
    })

    const bonifications = await Bonifications.find({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      organizationId: context.organizationId,
      affiliateId: context.affiliateId,
    })

    bonifications.forEach((order) => {
      returnObj.orders++
      returnObj.revenue += order.value
      returnObj.commission += order.value
      returnObj.orderList.push({
        id: order._id,
        client: clientNameAndDocument.name,
        date: moment(order.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
        value: order.value,
        commission: order.value,
        isPaid: order.isPaid,
      })
    })

    const saasCommissions = await SaasCommissions.find({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      organizationId: context.organizationId,
      affiliateId: context.affiliateId,
    })

    saasCommissions.forEach((order) => {
      returnObj.orders++
      returnObj.revenue += order.value
      returnObj.commission += order.commission
      returnObj.orderList.push({
        id: order._id,
        client: clientNameAndDocument.name,
        date: moment(order.createdAt).format('DD/MM/YYYY - HH:mm:ss'),
        value: order.value,
        commission: order.commission,
        isPaid: order.isPaid,
      })
    })

    return returnObj
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  handleOrganizationFinantialConciliationConfiguration,
  getFinantialConciliationConfigurationByOrganizationId,
  getAffiliatesValuesByMonth,
  getOrderListByAffiliateIdAndReferenceMonth,
}
