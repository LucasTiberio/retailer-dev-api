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
  ENGAGED = 'engaged',
  REJECTED = 'rejected',
  PAID = 'paid',
}
export interface AbandonedCartItem {
  productId: string
  imageUrl: string
  name: string
  quantity: number
  valueWhenAbandoned: number
}

interface BlockedAffiliate {
  id: string
  date: string
}

interface BlockedAffiliate {
  id: string;
  date: string;
}

export interface IAbandonedCart {
  organizationId: string
  orderFormId: string
  orderId?: string
  email: string
  phone?: string
  provider: AbandonedCartProvider
  items: AbandonedCartItem[]
  status?: string
  blockedAffiliates: BlockedAffiliate[]
  currentAssistantAffiliateId?: string
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
