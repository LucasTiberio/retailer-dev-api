import {
  IDefaultPayCommissionFromDB,
  ITimeToPayCommissionFromDB,
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
