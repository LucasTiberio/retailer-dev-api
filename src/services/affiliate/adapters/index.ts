import {
  IDefaultPayCommissionFromDB,
  ITimeToPayCommissionFromDB,
  IOrganizationCommission,
} from "../types";

export const defaultCommissionAdapter = (
  record: IDefaultPayCommissionFromDB
) => ({
  id: record.id,
  percentage: record.percentage,
  organizationServiceId: record.organization_service_id,
  updatedAt: record.updated_at,
  createdAt: record.created_at,
});

export const timeToPayCommissionAdapter = (
  record: ITimeToPayCommissionFromDB
) => ({
  id: record.id,
  days: record.days,
  organizationServiceId: record.organization_service_id,
  type: record.type,
  updatedAt: record.updated_at,
  createdAt: record.created_at,
});

export const organizationCommissionAdapter = (
  record: IOrganizationCommission
) => ({
  id: record.id,
  name: record.name,
  organizationId: record.organization_id,
  departmentId: record.department_id,
  active: record.active,
  type: record.type,
  commissionPercentage: record.commission_percentage,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});
