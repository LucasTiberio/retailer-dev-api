import { CommissionTypes } from '../types'

interface ICommissionOrder {
  id: string
  organization_id: string
  order: number
  type: CommissionTypes
}

export const commissionOrderAdapter = (record: ICommissionOrder) => ({
  id: record.id,
  organizationId: record.organization_id,
  order: record.order,
  type: record.type,
})
