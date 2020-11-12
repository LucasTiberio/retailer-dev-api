import { AbandonedCartStatus, IAbandonedCart, OrderFormDetails } from './types'
import AbandonedCart from './model/AbandonedCart'
import { abandonedCartAdapter } from './adapters'
import IntegrationService from '../integration/service'
import { Integrations } from '../integration/types'
import common from '../../common'
import { getVtexOrderById } from './client'

const getAbandonedCarts = async (organizationId: string) => {
  try {
    let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.UNPAID })
    let adaptedCarts = carts.map(abandonedCartAdapter)
    return adaptedCarts
  } catch (e) {
    throw new Error(e.message)
  }
}

const getAvailableAbandonedCartsAndMyAbandonedCarts = async (organizationId: string, affiliateId: string) => {
  const allAbandonedCarts = await AbandonedCart.find({ organizationId });

  // abandoned carts that affiliateId is not in blockedList & status = UNPAID | ENGAGED
  const availableAbandonedCarts = allAbandonedCarts.filter(abandonedCart => {
    const isUnpaidOrEngaged = abandonedCart.status === AbandonedCartStatus.ENGAGED || abandonedCart.status === AbandonedCartStatus.UNPAID;
    const affiliateIdIsNotBlocked = !!abandonedCart.blockedAffiliates.find(blockedItem => blockedItem.id !== affiliateId);

    return isUnpaidOrEngaged && affiliateIdIsNotBlocked;
  })
  const affiliateAbandonedCarts = allAbandonedCarts.filter(abandonedCart => abandonedCart.currentAssistantAffiliateId === affiliateId);

  return {
    availableAbandonedCarts,
    affiliateAbandonedCarts
  }
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

export default {
  getAbandonedCarts,
  handleCart,
  handleCartOrderId,
  getAvailableAbandonedCartsAndMyAbandonedCarts,
}
