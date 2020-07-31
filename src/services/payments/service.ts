import { PaymentMethod } from "./types";
import { fetchPaymentsService } from "./helpers";
import OrganizationService from "../organization/service";
import OrganizationRulesService from "../organization-rules/service";
import knexDatabase from "../../knex-database";
import { Integrations } from "../integration/types";
import { deactivateVtexIntegrationByOrganizationId } from "./repository/organizationIntegrationSecrets";

const createOrganizationCustomerPayment = async (
  createSubscribeInput: {
    token: string;
  },
  context: { organizationId: string }
) => {
  const query = `
    mutation createOrganizationCustomerPayment($input: CreateOrganizationCustomerPaymentInput!){
      createOrganizationCustomerPayment(input: $input)
    }`;

  const variables = {
    input: {
      organizationId: context.organizationId,
      token: createSubscribeInput.token,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.createOrganizationCustomerPayment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const createOrganizationCustomer = async (
  input: {
    cpfCnpj: string;
    number: string;
    zipCode: string;
    complement?: string;
  },
  context: { organizationId: string }
) => {
  const { cpfCnpj, number, zipCode, complement } = input;

  const { organizationId } = context;

  const organization = await OrganizationService.getOrganizationById(
    organizationId
  );

  const query = `
    mutation createOrganizationCustomer($input: CreateOrganizationCustomerInput!) {
        createOrganizationCustomer(input: $input)
    }`;

  let variables: any = {
    input: {
      name: organization.name,
      email: organization.contactEmail,
      cpfCnpj,
      number,
      zipCode,
      organizationId,
    },
  };

  if (complement) {
    variables.input.complement = complement;
  }

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.createOrganizationCustomer;
  } catch (error) {
    throw new Error(error.message);
  }
};

const editOrganizationCustomer = async (
  input: {
    cpfCnpj: string;
    number: string;
    zipCode: string;
    complement?: string;
  },
  context: { organizationId: string }
) => {
  const { cpfCnpj, number, zipCode, complement } = input;

  const { organizationId } = context;

  const query = `
    mutation editOrganizationCustomer($input: EditOrganizationCustomerInput!) {
        editOrganizationCustomer(input: $input)
    }`;

  let variables: any = {
    input: {
      cpfCnpj,
      number,
      zipCode,
      organizationId,
    },
  };

  if (complement) {
    variables.input.complement = complement;
  }

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.editOrganizationCustomer;
  } catch (error) {
    throw new Error(error.message);
  }
};

const sendRecurrencyTransaction = async (
  input: {
    planIdentifier: string;
    payableWith: PaymentMethod;
  },
  context: { organizationId: string }
) => {
  const query = `
    mutation sendRecurrencyTransaction($input: SendRecurrencyTransactionInput!) {
        sendRecurrencyTransaction(input: $input)
    }`;

  const variables = {
    input: {
      ...input,
      organizationId: context.organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    await knexDatabase
      .knex("organizations")
      .where("id", context.organizationId)
      .update({
        free_trial: false,
        free_trial_expires: null,
      });

    const affiliateRules = await OrganizationRulesService.getAffiliateTeammateRules(
      context.organizationId
    );

    if (
      !affiliateRules.providers.filter(
        (provider: { name: Integrations }) =>
          provider.name === Integrations.VTEX
      )[0].status
    ) {
      await deactivateVtexIntegrationByOrganizationId(context.organizationId);
    }

    return res.data.data.sendRecurrencyTransaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

const listAvailablePlans = async () => {
  const query = `
  query listAvailablePlans{
    listAvailablePlans{
      id
      name
      interval
      intervalType
      payableWith
      price
      bestPrice
      planRules{
        serviceName
        rules{
          maxTransactionTax
          maxTeammates
          maxAnalysts
          maxSales
          support
          training
          sso
        }
      }
    }
  }`;

  try {
    const res = await fetchPaymentsService(query);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.listAvailablePlans;
  } catch (error) {
    console.log(error.response.data);
    throw new Error(error.message);
  }
};

const listOrganizationCustomerPayment = async (organizationId: string) => {
  const query = `
    query listOrganizationCustomerPayment($input: ListOrganizationCustomerPaymentInput!){
      listOrganizationCustomerPayment(input: $input){
        id
        description
        itemType
        data{
          brand
          holder
          lastDigits
        }
      }
    }
  `;

  const variables = {
    input: {
      organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.listOrganizationCustomerPayment;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getSubscriptionByOrganizationId = async (organizationId: string) => {
  const query = `
    query getSubscriptionByOrganizationId($input: GetSubscriptionByOrganizationIdInput!) {
        getSubscriptionByOrganizationId(input: $input){
          id
          suspended
          planIdentifier
          priceCents
          currency
          expiresAt
          createdAt
          updatedAt
          cycledAt
          customerPaymentInfos{
            id
            description
            itemType
            data{
              brand
              holder
              lastDigits
            }
          }
          invoiceData{
            cpfCnpj
            zipCode
            number
            complement
            city
            state
            district
            street
          }
          payableWith
          planName
          active
          recentInvoices{
            id
            dueDate
            status
            total
            secureUrl
          }
        }
    }`;

  const variables = {
    input: {
      organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      console.log(res.data.errors);
      return null;
    }

    return res.data.data.getSubscriptionByOrganizationId;
  } catch (error) {
    throw new Error(error.message);
  }
};

const createEnterpriseRecurrencyTransaction = async (input: {
  zipCode: string;
  number: string;
  complement?: string;
  cpfCnpj: string;
  valueCents: number;
  organizationId: string;
}) => {
  const mutation = `
  mutation createEnterpriseRecurrencyTransaction($input: CreateEnterpriseRecurrencyTransactionInput!){
    createEnterpriseRecurrencyTransaction(input:$input)
  }`;

  const organization = await OrganizationService.getOrganizationById(
    input.organizationId
  );

  const variables: any = {
    input: {
      organizationId: organization.id,
      payableWith: "bank_slip",
      customer: {
        email: organization.contactEmail,
        name: organization.name,
        zipCode: input.zipCode,
        number: input.number,
        cpfCnpj: input.cpfCnpj,
      },
      valueCents: input.valueCents,
    },
  };

  if (input.complement) {
    variables.input.customer.complement = input.complement;
  }

  try {
    const res = await fetchPaymentsService(mutation, variables);

    if (res.data?.errors) {
      console.log(res.data.errors);
      throw new Error("error on create plan");
    }

    return res.data.data.createEnterpriseRecurrencyTransaction;
  } catch (error) {
    console.log(error.response.data);
    throw new Error(error.message);
  }
};

const updateRecurrencyTransaction = async (
  input: {
    planIdentifier: string;
    payableWith: PaymentMethod;
  },
  organizationId: string
) => {
  const query = `
    mutation updateRecurrencyTransaction($input: UpdateRecurrencyTransactionInput!) {
        updateRecurrencyTransaction(input: $input){
          id
          suspended
          planIdentifier
          priceCents
          payableWith
        }
    }`;

  const variables = {
    input: {
      ...input,
      organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.updateRecurrencyTransaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

const cancelRecurrencyTransaction = async (organizationId: string) => {
  const query = `
    mutation cancelRecurrencyTransaction($input: CancelRecurrencyTransactionInput!) {
        cancelRecurrencyTransaction(input: $input){
          id
          suspended
          planIdentifier
          priceCents
          payableWith
        }
    }`;

  const variables = {
    input: {
      organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.cancelRecurrencyTransaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

const activateRecurrencyTransaction = async (organizationId: string) => {
  const query = `
    mutation activateRecurrencyTransaction($input: ActivateRecurrencyTransactionInput!) {
        activateRecurrencyTransaction(input: $input){
          id
          suspended
          planIdentifier
          priceCents
          payableWith
        }
    }`;

  const variables = {
    input: {
      organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.activateRecurrencyTransaction;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeOrganizationCustomerPayment = async (
  input: {
    paymentId: string;
  },
  context: { organizationId: string }
) => {
  const query = `
    mutation removeOrganizationCustomerPayment($input: RemoveOrganizationCustomerPaymentInput!) {
        removeOrganizationCustomerPayment(input: $input)
    }`;

  const variables = {
    input: {
      ...input,
      organizationId: context.organizationId,
    },
  };

  try {
    const res = await fetchPaymentsService(query, variables);

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message);
    }

    return res.data.data.removeOrganizationCustomerPayment;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  createOrganizationCustomerPayment,
  updateRecurrencyTransaction,
  activateRecurrencyTransaction,
  sendRecurrencyTransaction,
  getSubscriptionByOrganizationId,
  removeOrganizationCustomerPayment,
  createOrganizationCustomer,
  listAvailablePlans,
  listOrganizationCustomerPayment,
  cancelRecurrencyTransaction,
  editOrganizationCustomer,
  createEnterpriseRecurrencyTransaction,
};
