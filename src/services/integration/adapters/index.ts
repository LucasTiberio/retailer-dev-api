import { IIntegration } from "../types";

export const integrationAdapter = (record: IIntegration) => ({
  id: record.id,
  active: record.active,
  type: record.type,
  organizationId: record.organization_id,
  integrationSecretsId: record.integration_secrets_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});
