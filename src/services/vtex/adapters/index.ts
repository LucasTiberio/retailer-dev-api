import { IVtexIntegrationFromDB, IVtexCommissionFromDB } from "../types";

export const vtexAdapter = (record: IVtexIntegrationFromDB) => ({
  id: record.id,
  organizationId: record.organization_id,
  storeName: record.store_name,
  updatedAt: record.updated_at,
  createdAt: record.created_at,
  vtexKey: record.vtex_key,
  vtexToken: record.vtex_token,
  status: record.status,
});

export const vtexCommissionsAdapter = (record: IVtexCommissionFromDB) => ({
  id: record.id,
  organizationId: record.organization_id,
  vtexDepartmentId: record.vtex_department_id,
  active: record.active,
  vtexCommissionPercentage: record.vtex_commission_percentage,
  updatedAt: record.updated_at,
  createdAt: record.created_at,
});
