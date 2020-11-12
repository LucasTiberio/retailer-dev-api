import { AbandonedCartStatus, IAbandonedCart, OrderFormDetails } from './types'
import AbandonedCart from './model/AbandonedCart'
import { abandonedCartAdapter } from './adapters'

const getAbandonedCarts = async (organizationId: string) => {
  try {
    let carts = await AbandonedCart.find({ organizationId, status: AbandonedCartStatus.UNPAID })
    let adaptedCarts = carts.map(abandonedCartAdapter)
    return adaptedCarts
  } catch (e) {
    throw new Error(e.message)
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

export default {
  getAbandonedCarts,
  handleCart,
}
