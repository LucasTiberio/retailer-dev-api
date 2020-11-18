import AbandonedCart, { IAbandonedCartSchema } from '../model/AbandonedCart'

export const checkCartReadOnly = async (cartId: string) => {
  let readOnly = false
  let childCarts = await AbandonedCart.find({ parent: cartId })
  if (childCarts?.length) {
    readOnly = true
  }
  return readOnly
}
