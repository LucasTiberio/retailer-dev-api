import { AbandonedCartStatus, IAbandonedCart, OrderFormDetails } from './types'
import AbandonedCart from './model/AbandonedCart'
import { abandonedCartAdapter, responseAbandonedCartAdapter } from './adapters'
import IntegrationService from '../integration/service'
import { Integrations } from '../integration/types'
import common from '../../common'
import { getVtexOrderById } from './client'
import moment from 'moment'
import OrganizationRepository from './repositories/organization'
import Axios from 'axios'
import {
  affiliateIsNotTheCurrentAssistant,
  cannotGenerateNewCartAtTheMoment,
  cartDoesNotHaveItems,
  cartHasNoAssistant,
  cartHasNoObservations,
  cartIsReadOnly,
  cartNotFound,
  observationNotFound,
  organizationDoesNotHaveVtexIntegration,
  systemMessagesAreNotRemovable,
} from '../../common/errors'
import { checkCartReadOnly, getPreviousCarts, getTotalsByOrganizationId } from './helpers'
import { Transaction } from 'knex'
import knexDatabase from '../../knex-database'

const getAbandonedCarts = async (organizationId: string) => {
  try {
    let dbCarts = await AbandonedCart.find({ organizationId, status: { $ne: AbandonedCartStatus.INVALID } })

    let noHasParentCarts = await Promise.all(
      dbCarts.map(async (cart) => {
        const asParent = await AbandonedCart.findOne({ parent: cart._id, status: { $ne: AbandonedCartStatus.INVALID } })

        if (asParent) {
          return null
        }

        return responseAbandonedCartAdapter(cart)
      })
    )

    let validCarts = noHasParentCarts.filter((item) => item)

    let totals = await getTotalsByOrganizationId(organizationId)
    return {
      totals,
      abandonedCarts: validCarts,
    }
  } catch (e) {
    throw new Error(e.message)
  }
}

const getAbandonedCartsRecoveredAmount = async (organizationId: string) => {
  let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.PAID })
  return carts.reduce((acc, cart) => {
    let itemsValue = 0.0
    cart.items.forEach((item) => {
      itemsValue += item.listPrice * item.quantity
    })
    return acc + itemsValue
  }, 0.0)
}

const getAbandonedCartsLostAmount = async (organizationId: string) => {
  let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.REJECTED })
  return carts.reduce((acc, cart) => {
    let itemsValue = 0.0
    cart.items.forEach((item) => {
      itemsValue += item.listPrice * item.quantity
    })
    return acc + itemsValue
  }, 0.0)
}

const getFilteredAbandonedCarts = async (organizationId: string, affiliateId: string) => {
  const allAbandonedCarts = await AbandonedCart.find({ organizationId, status: { $ne: AbandonedCartStatus.INVALID } }).lean()

  console.log({ allAbandonedCarts })

  return (
    await Promise.all(
      allAbandonedCarts.map(async (cart) => {
        const asParent = await AbandonedCart.findOne({ parent: cart._id, status: { $ne: AbandonedCartStatus.INVALID } })

        console.log({ asParent })

        if (asParent) {
          return null
        }

        let email: any = cart.email
        let phone: any = cart.phone
        let readOnly = await checkCartReadOnly(cart._id)
        let children = await getPreviousCarts(cart._id, cart.currentAssistantAffiliateId === affiliateId)
        if (!cart.currentAssistantAffiliateId || cart.currentAssistantAffiliateId !== affiliateId) {
          email = null
          phone = null
        }

        return {
          ...cart,
          id: cart._id,
          email,
          phone,
          readOnly,
          children,
          hasChildren: !!children.length,
          isChildren: false,
          isOwner: cart.currentAssistantAffiliateId === affiliateId,
        }
      })
    )
  ).filter((item) => item)
}

const handleCart = async (cartInfo: OrderFormDetails) => {
  const organization = await knexDatabase.knexConfig('organizations').where('id', cartInfo.organizationId).first().select('abandoned_cart')

  if (!organization) throw new Error('organization_not_found')

  if (!organization.abandoned_cart) throw new Error('organization_does_not_have_abandoned_cart_active')

  try {
    let cartObj = await AbandonedCart.findOne({ organizationId: cartInfo.organizationId, orderFormId: cartInfo.orderFormId })
    if (cartObj) {
      if (cartInfo.items.length) {
        cartObj.email = cartInfo.clientProfileData.email
        cartObj.phone = cartInfo.clientProfileData.phone
        cartObj.provider = cartInfo.provider
        cartObj.items = cartInfo.items
        cartObj.clientProfileData = cartInfo.clientProfileData
        cartObj.parent = cartObj.parent ?? cartInfo.parent
        await cartObj.save()
      } else {
        await cartObj.remove()
      }
    } else {
      let cartObjParent = await AbandonedCart.findOne({ organizationId: cartInfo.organizationId, _id: cartInfo.parent }).lean()

      const newCartObj: IAbandonedCart = {
        organizationId: cartInfo.organizationId,
        orderFormId: cartInfo.orderFormId,
        email: cartInfo.clientProfileData.email,
        phone: cartInfo.clientProfileData.phone,
        provider: cartInfo.provider,
        items: cartInfo.items,
        clientProfileData: cartInfo.clientProfileData,
        blockedAffiliates: cartObjParent?.blockedAffiliates.length ? cartObjParent.blockedAffiliates : [],
        parent: cartInfo.parent,
        currentAssistantAffiliateId: cartObjParent?.currentAssistantAffiliateId,
        lastAssistanceDate: cartObjParent?.lastAssistanceDate,
        status: cartObjParent?.status || AbandonedCartStatus.UNPAID,
      }
      await AbandonedCart.create(newCartObj)
    }
    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

const generateNewCart = async (abandonedCartId: string, organizationId: string) => {
  try {
    const abandonedCart = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId }).lean()

    if (!abandonedCart) {
      throw new Error(cartNotFound)
    }

    const organizationDomain = await OrganizationRepository.getOrganizationDomainById(organizationId)

    if (!abandonedCart.orderId) return `${organizationDomain.domain}/checkout/?orderFormId=${abandonedCart.orderFormId}#/cart#`

    if (abandonedCart.parent) {
      const now = moment().utc()
      const thirtyDaysAfterCartCreation = moment(abandonedCart.createdAt).utc().add(30, 'days')
      if (now.isBefore(thirtyDaysAfterCartCreation)) {
        throw new Error(cannotGenerateNewCartAtTheMoment)
      }
    }

    if (!abandonedCart.items.length) throw new Error(cartDoesNotHaveItems)

    const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

    if (integration.type !== Integrations.VTEX) throw new Error(organizationDoesNotHaveVtexIntegration)

    const decode: any = await common.jwtDecode(integration.secret)

    let baseUrl = `https://${decode.accountName}.vtexcommercestable.com.br`

    const { data: orderFormData } = await Axios.post(`${baseUrl}/api/checkout/pub/orderForm`)

    const marketingData = {
      utmSource: 'plugone_abandoned_cart',
      utmMedium: null,
      utmCampaign: abandonedCart._id,
      utmipage: '',
      utmiPart: '',
      utmiCampaign: '',
      coupon: null,
      marketingTags: [],
    }

    await Axios.post(`${baseUrl}/api/checkout/pub/orderForm/${orderFormData.orderFormId}/attachments/marketingData`, marketingData)

    const orderItems = abandonedCart.items.map((item, index) => {
      return { quantity: item.quantity, seller: item.seller, id: item.id }
    })

    const { data } = await Axios.patch(
      `${baseUrl}/api/checkout/pub/orderForm/${orderFormData.orderFormId}/items`,
      { orderItems },
      {
        headers: {
          'x-vtex-api-appkey': decode.xVtexApiAppKey,
          'x-vtex-api-apptoken': decode.xVtexApiAppToken,
        },
      }
    )

    return `${organizationDomain.domain}/checkout/?orderFormId=${orderFormData.orderFormId}#/cart#?`
  } catch (error) {
    console.log(error.response)
    throw new Error(error.message)
  }
}

const handleCartOrderId = async (cartInfo: { orderId: string; organizationId: string }) => {
  const { orderId, organizationId } = cartInfo

  const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

  if (integration.type !== Integrations.VTEX) throw new Error(organizationDoesNotHaveVtexIntegration)

  const decode = await common.jwtDecode(integration.secret)

  const order = await getVtexOrderById(decode, orderId)

  await AbandonedCart.findOneAndUpdate({ organizationId, orderFormId: order.orderFormId }, { orderId })

  return true
}

const assumeCartAssistance = async (abandonedCartId: string, organizationId: string, affiliateId: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    const now = moment().utc().toISOString()
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.blockedAffiliates.find((item) => item.id === affiliateId)) {
        throw new Error('affiliate_is_on_blocked_list')
      }
      cartObj.currentAssistantAffiliateId = affiliateId
      cartObj.lastAssistanceDate = now
      cartObj.status = AbandonedCartStatus.ENGAGED
      await cartObj.save()
      while (!!cartObj?.parent) {
        cartObj = await AbandonedCart.findById(cartObj?.parent)
        if (cartObj) {
          cartObj.currentAssistantAffiliateId = affiliateId
          cartObj.lastAssistanceDate = now
          cartObj.status = AbandonedCartStatus.ENGAGED
          await cartObj.save()
        }
      }
      return cartObj
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const leaveCartAssistance = async (abandonedCartId: string, organizationId: string, affiliateId: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    const now = moment().utc().toISOString()
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.currentAssistantAffiliateId === affiliateId && cartObj.status === AbandonedCartStatus.ENGAGED) {
        cartObj.currentAssistantAffiliateId = undefined
        cartObj.status = AbandonedCartStatus.UNPAID
        cartObj.blockedAffiliates.push({
          id: affiliateId,
          date: now,
        })
        await cartObj.save()
        while (!!cartObj?.parent) {
          cartObj = await AbandonedCart.findById(cartObj?.parent)
          if (cartObj) {
            if (cartObj.currentAssistantAffiliateId) {
              cartObj.currentAssistantAffiliateId = undefined
            }
            cartObj.blockedAffiliates.push({
              id: affiliateId,
              date: now,
            })
            await cartObj.save()
          }
        }
        return true
      }
      throw new Error(affiliateIsNotTheCurrentAssistant)
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const rejectCartAssistance = async (abandonedCartId: string, organizationId: string, affiliateId: string, observation: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    const now = moment().utc().toISOString()
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.currentAssistantAffiliateId === affiliateId && cartObj.status === AbandonedCartStatus.ENGAGED) {
        cartObj.status = AbandonedCartStatus.REJECTED
        if (!cartObj.observations) {
          cartObj.observations = []
        }
        cartObj.observations.push({
          assistantId: affiliateId,
          content: observation,
          createdAt: now,
          updatedAt: now,
        })
        await cartObj.save()
        while (!!cartObj?.parent) {
          cartObj = await AbandonedCart.findById(cartObj?.parent)
          if (cartObj) {
            cartObj.status = AbandonedCartStatus.REJECTED
            await cartObj.save()
          }
        }
        return cartObj
      }
      throw new Error(affiliateIsNotTheCurrentAssistant)
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const createObservation = async (abandonedCartId: string, organizationId: string, affiliateId: string, observation: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.currentAssistantAffiliateId === affiliateId) {
        if (!cartObj.observations) {
          cartObj.observations = []
        }
        const now = moment().utc().toISOString()
        cartObj.observations.push({
          assistantId: affiliateId,
          content: observation,
          createdAt: now,
          updatedAt: now,
        })
        await cartObj.save()
        return true
      }
      throw new Error(affiliateIsNotTheCurrentAssistant)
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const editObservation = async (abandonedCartId: string, organizationId: string, affiliateId: string, observationIndex: number, observation: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.currentAssistantAffiliateId === affiliateId) {
        if (!cartObj.observations) {
          throw new Error(cartHasNoObservations)
        }
        if (cartObj.observations[observationIndex]) {
          const now = moment().utc().toISOString()
          cartObj.observations[observationIndex].content = observation
          cartObj.observations[observationIndex].updatedAt = now
          await cartObj.save()
          return cartObj
        } else {
          throw new Error(observationNotFound)
        }
      }
      throw new Error(affiliateIsNotTheCurrentAssistant)
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const removeObservation = async (abandonedCartId: string, organizationId: string, affiliateId: string, observationIndex: number) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.currentAssistantAffiliateId === affiliateId) {
        if (!cartObj.observations) {
          throw new Error(cartHasNoObservations)
        }
        if (cartObj.observations[observationIndex]) {
          if (!cartObj.observations[observationIndex].systemMessage) {
            cartObj.observations = cartObj.observations.filter((_, index) => index !== observationIndex)
            await cartObj.save()
            return true
          } else {
            throw new Error(systemMessagesAreNotRemovable)
          }
        } else {
          throw new Error(observationNotFound)
        }
      }
      throw new Error(affiliateIsNotTheCurrentAssistant)
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const removeCartAssistance = async (abandonedCartId: string, organizationId: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (await checkCartReadOnly(cartObj._id)) {
        throw new Error(cartIsReadOnly)
      }
      if (cartObj.status === AbandonedCartStatus.ENGAGED && cartObj.currentAssistantAffiliateId) {
        const oldAffiliateId = cartObj.currentAssistantAffiliateId
        cartObj.currentAssistantAffiliateId = undefined
        cartObj.status = AbandonedCartStatus.UNPAID
        cartObj.blockedAffiliates.push({
          id: oldAffiliateId,
          date: moment().utc().toISOString(),
        })
        await cartObj.save()
        while (!!cartObj?.parent) {
          cartObj = await AbandonedCart.findById(cartObj?.parent)
          if (cartObj) {
            if (cartObj.status !== AbandonedCartStatus.INVALID) {
              cartObj.status = AbandonedCartStatus.UNPAID
            }
            if (cartObj.currentAssistantAffiliateId) {
              cartObj.currentAssistantAffiliateId = undefined
            }
            if (!cartObj.blockedAffiliates) {
              cartObj.blockedAffiliates = []
            }
            cartObj.blockedAffiliates.push({
              id: oldAffiliateId,
              date: moment().utc().toISOString(),
            })
            await cartObj.save()
          }
        }
        return cartObj
      }
      throw new Error(cartHasNoAssistant)
    }
    throw new Error(cartNotFound)
  } catch (e) {
    throw new Error(e.message)
  }
}

const handleAbandonedCartActivity = async (
  input: {
    active: boolean
  },
  organizationId: string,
  trx: Transaction
) => {
  try {
    await OrganizationRepository.handleAbandonedCartActivityByOrganizationId(input.active, organizationId, trx)
    return true
  } catch (error) {
    throw new Error(error.message)
  }
}

const hasAbandonedCart = async (organizationId: string) => {
  const organizationAbandonedCart = await knexDatabase.knexConfig('organizations').where('organization_id', organizationId).first().select('abandoned_cart')

  return organizationAbandonedCart.abandoned_cart
}

export default {
  getAbandonedCarts,
  getAbandonedCartsRecoveredAmount,
  getAbandonedCartsLostAmount,
  handleCart,
  handleCartOrderId,
  assumeCartAssistance,
  handleAbandonedCartActivity,
  leaveCartAssistance,
  rejectCartAssistance,
  createObservation,
  editObservation,
  removeObservation,
  removeCartAssistance,
  getFilteredAbandonedCarts,
  generateNewCart,
  hasAbandonedCart,
}
