export interface OrderFormDetails {
  organizationId: string
  orderFormId: string
  provider: AbandonedCartProvider
  clientProfileData: {
    email: string
    phone: string
  }
  items: AbandonedCartItem[]
}

export enum AbandonedCartProvider {
  VTEX = 'vtex',
}

export enum AbandonedCartStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REJECTED = 'rejected',
  ENGAGED = 'engaged',
}
export interface AbandonedCartItem {
  productId: string
  imageUrl: string
  name: string
  quantity: string
}

export interface IAbandonedCart {
  organizationId: string
  orderFormId: string
  email: string
  phone?: string
  provider: AbandonedCartProvider
  items: AbandonedCartItem[]
}
