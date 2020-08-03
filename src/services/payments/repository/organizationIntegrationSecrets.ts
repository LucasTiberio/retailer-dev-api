import knexDatabase from "../../../knex-database";
import { Integrations } from "../../integration/types";

export const deactivateVtexIntegrationByOrganizationId = async (
  organizationId: string
) => {
  await knexDatabase
    .knex("organization_integration_secrets")
    .update({ active: false })
    .where("organization_id", organizationId)
    .andWhere("type", Integrations.VTEX);
};
