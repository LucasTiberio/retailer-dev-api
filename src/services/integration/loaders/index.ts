import store from "../../../store";
import knexDatabase from "../../../knex-database";
import { integrationAdapter } from "../adapters";

export const organizationServicesByOrganizationIdLoader = store.registerOneToOneLoader(
  async (organizationIds: string[]) => {
    const query = await knexDatabase
      .knex("organization_integration_secrets")
      .whereIn("organization_id", organizationIds)
      .andWhere("active", true)
      .select("*");
    return query;
  },
  "organization_id",
  integrationAdapter
);
