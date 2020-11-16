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
  seller: string
  quantity: number
  price: number
  additionalInfo: AdditionalInfo
}

export interface AdditionalInfo {
  categoriesIds: string
}

export interface IAbandonedCart {
  organizationId: string
  orderFormId: string
  clientProfileData: any
  orderId?: string
  email: string
  phone?: string
  provider: AbandonedCartProvider
  items: AbandonedCartItem[]
  status?: string
  lastAssistantAffiliateId?: string
  lastAssistanceDate?: string
  observations?: AbandonedCartObservationItem[]
  createdAt?: string
  updatedAt?: string
}

export interface AbandonedCartFromDB {
  _id: string
  organizationId: string
  orderFormId: string
  orderId?: string
  email: string
  phone?: string
  provider: string
  items: AbandonedCartItem[]
  status?: string
  lastAssistantAffiliateId?: string
  lastAssistanceDate?: string
  observations?: AbandonedCartObservationItem[]
  createdAt?: string
  updatedAt?: string
}

export interface AbandonedCartObservationItem {
  assistantId: string
  content: string
  createdAt: string
  updatedAt: string
}
