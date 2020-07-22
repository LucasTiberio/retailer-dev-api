import { Transaction } from "knex";
import { Integrations } from "./types";
import common from "../../common";
import VtexService from "../vtex/service";
import { IVtexSecrets } from "../vtex/types";
import knexDatabase from "../../knex-database";
import { organizationServicesByOrganizationIdLoader } from "./loaders";

const _secretToJwt = (obj: object) => {
  return common.jwtEncode(obj);
};

const createIntegration = async (
  input: {
    secrets: IVtexSecrets;
    type: Integrations;
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const { secrets, type } = input;

  try {
    switch (type) {
      case Integrations.VTEX:
        await VtexService.verifyVtexSecrets(secrets);
        await VtexService.createVtexHook(secrets);
        const jwtSecret = await _secretToJwt(input.secrets);
        await attachIntegration(
          context.organizationId,
          jwtSecret,
          type,
          input.secrets.accountName,
          trx
        );
        return true;
      default:
        return;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const attachIntegration = async (
  organizationId: string,
  jwtSecret: string,
  type: Integrations,
  identifier: string,
  trx: Transaction
) => {
  const organizationIntegrationFound = await getIntegrationByOrganizationIdAndType(
    organizationId,
    type,
    trx
  );

  let secret = await getIntegrationSecretByJwtSecret(jwtSecret, trx);

  if (!secret) {
    secret = await createIntegrationSecret(jwtSecret, trx);
  }

  if (organizationIntegrationFound) {
    await updateOrganizationSecret(
      secret.id,
      organizationIntegrationFound.id,
      trx
    );
  } else {
    await createOrganizationSecret(
      secret.id,
      organizationId,
      type,
      identifier,
      trx
    );
  }
};

const createIntegrationSecret = async (jwtSecret: string, trx: Transaction) => {
  const [secretCreated] = await (trx || knexDatabase)("integration_secrets")
    .insert({
      secret: jwtSecret,
    })
    .returning("*");

  return secretCreated;
};

const updateOrganizationSecret = async (
  secretId: string,
  organizationIntegrationId: string,
  trx: Transaction
) => {
  await (trx || knexDatabase)("organization_integration_secrets")
    .update({
      integration_secrets_id: secretId,
    })
    .where("id", organizationIntegrationId)
    .returning("*");
};

const createOrganizationSecret = async (
  secretId: string,
  organizationId: string,
  type: Integrations,
  identifier: string,
  trx: Transaction
) => {
  await (trx || knexDatabase)("organization_integration_secrets")
    .insert({
      integration_secrets_id: secretId,
      organization_id: organizationId,
      type,
      identifier: identifier,
    })
    .returning("*");
};

const getIntegrationSecretByJwtSecret = async (
  jwtSecret: string,
  trx: Transaction
) => {
  const secretFound = await (trx || knexDatabase)("integration_secrets")
    .where("secret", jwtSecret)
    .first()
    .select();

  return secretFound;
};

const getIntegrationByOrganizationIdAndType = async (
  organizationId: string,
  type: Integrations,
  trx: Transaction
) => {
  const organizationIntegrationFound = await (trx || knexDatabase)(
    "organization_integration_secrets"
  )
    .where("organization_id", organizationId)
    .andWhere("type", type)
    .first()
    .select();

  return organizationIntegrationFound;
};

const verifyIntegration = async (organizationId: string) => {
  const integration = await organizationServicesByOrganizationIdLoader().load(
    organizationId
  );
  return integration
    ? {
        status: integration.active,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }
    : null;
};

export default {
  createIntegration,
  verifyIntegration,
};
