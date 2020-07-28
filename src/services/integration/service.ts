import { Transaction } from "knex";
import { Integrations, ILojaIntegradaSecrets } from "./types";
import common from "../../common";
import VtexService from "../vtex/service";
import { IVtexSecrets } from "../vtex/types";
import knexDatabase from "../../knex-database";
import { organizationServicesByOrganizationIdLoader } from "./loaders";
import Axios from "axios";

const _secretToJwt = (obj: object) => {
  return common.jwtEncode(obj);
};

const createIntegration = async (
  input: {
    secrets: any;
    type: Integrations;
  },
  context: { organizationId: string },
  trx: Transaction
) => {
  const { secrets, type } = input;

  try {
    switch (type) {
      case Integrations.VTEX:
        if (
          secrets.xVtexApiAppKey &&
          secrets.xVtexApiAppToken &&
          secrets.accountName
        ) {
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
        }
        throw new Error("Vtex integration need other keys.");
      case Integrations.LOJA_INTEGRADA:
        if (secrets.appKey) {
          await verifyLojaIntegradaSecrets(secrets);
          const jwtSecret = await _secretToJwt(input.secrets);
          await attachIntegration(
            context.organizationId,
            jwtSecret,
            type,
            secrets.appKey,
            trx
          );
          return true;
        }
        throw new Error("Loja integrada integration need other keys.");
      default:
        return;
    }
  } catch (error) {
    console.log(error?.response?.data || error.message);
    throw new Error(error.message);
  }
};

const verifyLojaIntegradaSecrets = async (secrets: ILojaIntegradaSecrets) => {
  const lojaIntegradaOrders = await Axios.get(
    "https://api.awsli.com.br/v1/pedido/search",
    {
      params: {
        chave_aplicacao: process.env.LOJA_INTEGRADA_APPLICATION_KEY,
        chave_api: secrets.appKey,
      },
    }
  );

  if (lojaIntegradaOrders.status === 200) {
    return true;
  }

  throw new Error("fail in loja integrada app key verification.");
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

  await inactiveOtherIntegrationsByOrganizationId(organizationId, type, trx);

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

const inactiveOtherIntegrationsByOrganizationId = async (
  organizationId: string,
  type: Integrations,
  trx: Transaction
) => {
  await (trx || knexDatabase)("organization_integration_secrets")
    .update({
      active: false,
    })
    .where("organization_id", organizationId)
    .andWhereNot("type", type);
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
      active: true,
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
      active: true,
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
        type: integration.type,
        status: integration.active,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }
    : null;
};

const getIntegrationByOrganizationId = async (
  organizationId: string,
  trx: Transaction
) => {
  const integration = await (trx || knexDatabase.knex)(
    "organization_integration_secrets AS ois"
  )
    .innerJoin(
      "integration_secrets AS is",
      "is.id",
      "ois.integration_secrets_id"
    )
    .where("ois.organization_id", organizationId)
    .andWhere("active", true)
    .first()
    .select("*");

  return integration;
};

export default {
  createIntegration,
  verifyIntegration,
  getIntegrationByOrganizationId,
};
