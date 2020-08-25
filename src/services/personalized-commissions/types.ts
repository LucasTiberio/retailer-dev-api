export type CommissionsOrder = {
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
