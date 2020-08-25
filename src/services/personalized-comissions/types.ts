export type ComissionsOrder = {
  type: string
  order: number
}

export enum CommissionTypes {
  DEPARTMENT = 'department',
  AFFILIATE = 'affiliate',
  CATEGORY = 'category',
  PRODUCT = 'product',
  SELLER = 'seller',
}
