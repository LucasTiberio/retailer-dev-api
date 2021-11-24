export interface OrderFormDetails {
  organizationId: string
  orderFormId: string
  provider: AbandonedCartProvider
  clientProfileData: {
    email: string
    phone: string
  }
  items: AbandonedCartItem[]
  parent?: string
}

export enum AbandonedCartProvider {
  VTEX = 'vtex',
}

export enum AbandonedCartStatus {
  UNPAID = 'unpaid',
  ENGAGED = 'engaged',
  REJECTED = 'rejected',
  PAID = 'paid',
  INVALID = 'invalid',
}
export interface AbandonedCartItem {
  id: string
  productId: string
  imageUrl: string
  name: string
  seller: string
  quantity: number
  price: number
  listPrice: number
  additionalInfo: AdditionalInfo
}

export interface AdditionalInfo {
  categoriesIds: string
}

interface BlockedAffiliate {
  id: string
  date: string
}

interface BlockedAffiliate {
  id: string
  date: string
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
  parent?: string
  status?: string
  blockedAffiliates: BlockedAffiliate[]
  currentAssistantAffiliateId?: string
  lastAssistanceDate?: string
  observations?: AbandonedCartObservationItem[]
  createdAt?: string
  updatedAt?: string
  children?: IAbandonedCart[]
  hasChildren?: boolean
}

export interface AbandonedCartFromDB {
  _id?: string
  organizationId: string
  orderFormId: string
  orderId?: string
  email: string
  phone?: string
  parent?: string
  currentAssistantAffiliateId?: string
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
  systemMessage?: boolean
}
