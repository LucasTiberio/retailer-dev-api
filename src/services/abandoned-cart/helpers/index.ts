import { abandonedCartAdapter } from '../adapters'
import AbandonedCart, { IAbandonedCartSchema } from '../model/AbandonedCart'
import { AbandonedCartStatus } from '../types'

export const checkCartReadOnly = async (cartId: string) => {
  let cart = await AbandonedCart.findById(cartId).lean()
  if (cart?.status === 'paid') {
    return true
  }
  let childCarts = await AbandonedCart.find({ parent: cartId })
  if (childCarts?.length) {
    return true
  }
  return false
}

export const getPreviousCarts = async (cartId: string, isOwner: boolean) => {
  let carts = []
  let cart = await AbandonedCart.findById(cartId)
  if (cart) {
    while (!!cart?.parent) {
      cart = await AbandonedCart.findById(cart?.parent)
      if (cart) {
        carts.push(abandonedCartAdapter(cart, isOwner))
      }
    }
  }
  return carts
}

export const getTotalsByOrganizationId = async (organizationId: string) => {
  let totals = {
    unpaid: 0,
    engaged: 0,
    rejected: 0,
    paid: 0,
  }
  let carts = await AbandonedCart.find({ organizationId, status: { $ne: AbandonedCartStatus.INVALID } })
  if (carts?.length) {
    carts.forEach((cart) => {
      switch (cart.status) {
        case AbandonedCartStatus.UNPAID:
          totals.unpaid++
          break
        case AbandonedCartStatus.ENGAGED:
          totals.engaged++
          break
        case AbandonedCartStatus.REJECTED:
          totals.rejected++
          break
        case AbandonedCartStatus.PAID:
          totals.paid++
          break
      }
    })
  }
  return totals
}
