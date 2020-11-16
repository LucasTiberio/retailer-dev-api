import { AbandonedCartStatus, IAbandonedCart, OrderFormDetails } from './types'
import AbandonedCart from './model/AbandonedCart'
import { abandonedCartAdapter } from './adapters'
import IntegrationService from '../integration/service'
import { Integrations } from '../integration/types'
import common from '../../common'
import { getVtexOrderById } from './client'
import moment from 'moment'

const getAbandonedCarts = async (organizationId: string) => {
  try {
    let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.UNPAID })
    let adaptedCarts = carts.map(abandonedCartAdapter)
    return adaptedCarts
  } catch (e) {
    throw new Error(e.message)
  }
}

const getAbandonedCartsRecoveredAmount = async (organizationId: string) => {
  let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.PAID })
  return carts.reduce((acc, cart) => {
    let itemsValue = 0.0
    cart.items.forEach((item) => {
      itemsValue += item.price * item.quantity
    })
    return acc + itemsValue
  }, 0.0)
}

const getAbandonedCartsLostAmount = async (organizationId: string) => {
  let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.REJECTED })
  return carts.reduce((acc, cart) => {
    let itemsValue = 0.0
    cart.items.forEach((item) => {
      itemsValue += item.price * item.quantity
    })
    return acc + itemsValue
  }, 0.0)
}

const getFilteredAbandonedCarts = async (organizationId: string, affiliateId: string) => {
  const allAbandonedCarts = await AbandonedCart.find({ organizationId }).lean()
  return allAbandonedCarts.map((cart) => {
    let email: any = cart.email
    let phone: any = cart.phone
    if (!cart.currentAssistantAffiliateId || cart.currentAssistantAffiliateId !== affiliateId) {
      email = null
      phone = null
    }

    return {
      ...cart,
      id: cart._id,
      email,
      phone,
    }
  })
}

const handleCart = async (cartInfo: OrderFormDetails) => {
  try {
    let cartObj = await AbandonedCart.findOne({ organizationId: cartInfo.organizationId, orderFormId: cartInfo.orderFormId })
    if (cartObj) {
      if (cartInfo.items.length) {
        cartObj.email = cartInfo.clientProfileData.email
        cartObj.phone = cartInfo.clientProfileData.phone
        cartObj.provider = cartInfo.provider
        cartObj.items = cartInfo.items
        cartObj.clientProfileData = cartInfo.clientProfileData
        await cartObj.save()
      } else {
        await cartObj.remove()
      }
    } else {
      const newCartObj: IAbandonedCart = {
        organizationId: cartInfo.organizationId,
        orderFormId: cartInfo.orderFormId,
        email: cartInfo.clientProfileData.email,
        phone: cartInfo.clientProfileData.phone,
        provider: cartInfo.provider,
        items: cartInfo.items,
        clientProfileData: cartInfo.clientProfileData,
        blockedAffiliates: [],
      }
      await AbandonedCart.create(newCartObj)
    }
    return true
  } catch (e) {
    throw new Error(e.message)
  }
}

const handleCartOrderId = async (cartInfo: { orderId: string; organizationId: string }) => {
  const { orderId, organizationId } = cartInfo

  const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

  if (integration.type !== Integrations.VTEX) throw new Error('Organization does not have vtex integration')

  const decode = await common.jwtDecode(integration.secret)

  const order = await getVtexOrderById(decode, orderId)

  await AbandonedCart.findOneAndUpdate({ organizationId, orderFormId: order.orderFormId }, { orderId })

  return true
}

const assumeCartAssistance = async (abandonedCartId: string, organizationId: string, affiliateId: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      cartObj.currentAssistantAffiliateId = affiliateId
      cartObj.lastAssistanceDate = moment().utc().toISOString()
      await cartObj.save()
      return true
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

const leaveCartAssistance = async (abandonedCartId: string, organizationId: string, affiliateId: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (cartObj.currentAssistantAffiliateId === affiliateId && cartObj.status === AbandonedCartStatus.ENGAGED) {
        delete cartObj.currentAssistantAffiliateId
        cartObj.status = AbandonedCartStatus.UNPAID
        cartObj.blockedAffiliates.push({
          id: affiliateId,
          date: moment().utc().toISOString(),
        })
        await cartObj.save()
        return true
      }
      throw new Error('Affiliate is not the current assistant')
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

const rejectCartAssistance = async (abandonedCartId: string, organizationId: string, affiliateId: string, observation: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (cartObj.currentAssistantAffiliateId === affiliateId && cartObj.status === AbandonedCartStatus.ENGAGED) {
        cartObj.status = AbandonedCartStatus.REJECTED
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
      throw new Error('Affiliate is not the current assistant')
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

const createObservation = async (abandonedCartId: string, organizationId: string, affiliateId: string, observation: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
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
      throw new Error('Affiliate is not the current assistant')
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

const editObservation = async (abandonedCartId: string, organizationId: string, affiliateId: string, observationIndex: number, observation: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (cartObj.currentAssistantAffiliateId === affiliateId) {
        if (!cartObj.observations) {
          throw new Error('Abandoned cart has no observations')
        }
        if (cartObj.observations[observationIndex]) {
          const now = moment().utc().toISOString()
          cartObj.observations[observationIndex].content = observation
          cartObj.observations[observationIndex].updatedAt = now
          await cartObj.save()
          return true
        } else {
          throw new Error('Observation not found')
        }
      }
      throw new Error('Affiliate is not the current assistant')
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

const removeObservation = async (abandonedCartId: string, organizationId: string, affiliateId: string, observationIndex: number) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (cartObj.currentAssistantAffiliateId === affiliateId) {
        if (!cartObj.observations) {
          throw new Error('Abandoned cart has no observations')
        }
        if (cartObj.observations[observationIndex]) {
          cartObj.observations = cartObj.observations.filter((_, index) => index !== observationIndex)
          await cartObj.save()
          return true
        } else {
          throw new Error('Observation not found')
        }
      }
      throw new Error('Affiliate is not the current assistant')
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

const removeCartAssistance = async (abandonedCartId: string, organizationId: string) => {
  try {
    let cartObj = await AbandonedCart.findOne({ _id: abandonedCartId, organizationId })
    if (cartObj) {
      if (cartObj.status === AbandonedCartStatus.ENGAGED && cartObj.currentAssistantAffiliateId) {
        const oldAffiliateId = cartObj.currentAssistantAffiliateId
        delete cartObj.currentAssistantAffiliateId
        cartObj.status = AbandonedCartStatus.UNPAID
        cartObj.blockedAffiliates.push({
          id: oldAffiliateId,
          date: moment().utc().toISOString(),
        })
        await cartObj.save()
        return true
      }
      throw new Error('Cart has no assistant')
    }
    throw new Error('Abandoned cart not found')
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  getAbandonedCarts,
  getAbandonedCartsRecoveredAmount,
  getAbandonedCartsLostAmount,
  handleCart,
  handleCartOrderId,
  assumeCartAssistance,
  leaveCartAssistance,
  rejectCartAssistance,
  createObservation,
  editObservation,
  removeObservation,
  removeCartAssistance,
  getFilteredAbandonedCarts,
}
