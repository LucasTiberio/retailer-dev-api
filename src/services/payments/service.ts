import { ICreateSubscribe, PaymentMethod, ISaveCreditCard, ICreditCard, Billing, Customer } from './types';
import { paymentFactory, fetchPaymentsService, updatePaymentsFactory } from './helpers';
import payments from '.';
import { getOperationAST } from 'graphql';

const createSubscribe = async (createSubscribeInput: ICreateSubscribe) => {

  const query = `
    mutation sendRecurrencyTransaction($input: SendRecurrencyTransactionInput!) {
        sendRecurrencyTransaction(input: $input){
            status
        }
    }`

    const payment = paymentFactory(createSubscribeInput)

    let variables = {
        input: {
            ...payment
        }
    };

    if(createSubscribeInput.paymentMethod === PaymentMethod.credit_card){
      const creditCardSaved = await saveCreditCard({
        ...createSubscribeInput.creditCard,
        externalId: createSubscribeInput.organizationId
      })
      variables.input.cardId = creditCardSaved.id
    }

    const res = await fetchPaymentsService(query, variables);

    if(res.data.errors){
      throw new Error(res.data.errors[0].message)
    }
  
}

const saveCreditCard = async (saveCreditCardInput: ISaveCreditCard) => {

  const { cvv, expirationDate, externalId, holderName, number } = saveCreditCardInput;

  const query = `
    mutation saveOrganizationCreditCard($input: SaveOrganizationCreditCardInput!) {
        saveOrganizationCreditCard(input: $input){
          id
          brand
          holderName
          lastDigits
          country
          expirationDate
          valid
        }
    }`

  const variables = {
      input: {
        number,
        holderName,
        expirationDate,
        cvv,
        externalId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }
  
    return res.data.data.saveOrganizationCreditCard
  
  } catch (error) {    
    throw new Error(error.message);
  }

}

const listAvailablePlans = async () => {

  const query = `
    query listAvailablePlans{
      listAvailablePlans{
          id
          amount
          days
          name
          paymentMethods
          installments
        }
    }`

  try {

    const res = await fetchPaymentsService(query);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }
  
    return res.data.data.listAvailablePlans
  
  } catch (error) {
    throw new Error(error.message);
  }

}

const listCardsByOrganizationId = async (organizationId: string) => {

  const query = `
  query listCardsByOrganizationId($input: ListCardsByOrganizationIdInput!) {
      listCardsByOrganizationId(input: $input){
        id
        brand
        holderName
        lastDigits
        country
        expirationDate
        valid
      }
  }`

  const variables = {
      input: {
        organizationId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.listCardsByOrganizationId

  } catch (error) {
    throw new Error(error.message);
  }
}

const saveOrganizationCreditCard = async (
  saveOrganizationCreditCardInput: {
    number: string, 
    holderName: string, 
    expirationDate: string, 
    cvv: string
  },
  context: { organizationId: string }
) => {

  const query = `
    mutation saveOrganizationCreditCard($input: SaveOrganizationCreditCardInput!) {
        saveOrganizationCreditCard(input: $input){
          brand
          holderName
          lastDigits
          country
          expirationDate
          valid
        }
    }`

  const variables = {
      input: {
        ...saveOrganizationCreditCardInput,
        externalId: context.organizationId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.saveOrganizationCreditCard

  } catch (error) {
    throw new Error(error.message);
  }
  
}

const removeCardById = async (
    removeCardByIdInput: {id : string},
    context: { organizationId: string }
  ) => {

  const query = `
    mutation removeCardById($input: RemoveCardByIdInput!) {
        removeCardById(input: $input)
    }`

  const variables = {
      input: {
        id: removeCardByIdInput.id,
        externalId: context.organizationId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.removeCardById

  } catch (error) {
    throw new Error(error.message);
  }

}

const getSubscriptionByOrganizationId = async (organizationId: string) => {

  const query = `
    query getSubscriptionByOrganizationId($input: GetSubscriptionByOrganizationIdInput!) {
        getSubscriptionByOrganizationId(input: $input){
          id
          plan{
            id
            amount
            days
            name
            paymentMethods
            installments
          }
          currentTransaction{
            status
            dateCreated
            dateUpdated
            paidAmount
          }
          currentPeriodStart
          currentPeriodEnd
          manageUrl
        }
    }`

  const variables = {
      input: {
        organizationId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.getSubscriptionByOrganizationId

  } catch (error) {
    throw new Error(error.message);
  }

}

const getSubscriptionTransactions = async (organizationId: string) => {

  const query = `
    query getTransactionsBySubscriptionId($input: GetTransactionsBySubscriptionIdInput!) {
        getTransactionsBySubscriptionId(input: $input){
          id
          status
          dateCreated
          paidAmount
          postbackUrl
          dateUpdated
          boletoBarcode
          boletoExpirationDate
          boletoUrl
          paymentMethod
        }
    }`

  const variables = {
      input: {
        organizationId
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.getTransactionsBySubscriptionId

  } catch (error) {
    throw new Error(error.message);
  }

}

const updateRecurrencyTransaction = async (
  updateRecurrencyTransactionInput: {
    planId: string
    recurrencyId: string
    cardId?: string
    paymentMethod: PaymentMethod
    billing?: Billing
    customer?: Customer
  },
  context: { organizationId: string }
) => {

  const query = `
    mutation updateRecurrencyTransaction($input: UpdateRecurrencyTransactionInput!) {
        updateRecurrencyTransaction(input: $input){
          status
        }
    }`

  const payment = updatePaymentsFactory({
    organizationId: context.organizationId,
    paymentMethod: updateRecurrencyTransactionInput.paymentMethod,
    plan: updateRecurrencyTransactionInput.planId,
    customer: updateRecurrencyTransactionInput.customer
  })

  if(updateRecurrencyTransactionInput.cardId){
    payment.cardId = updateRecurrencyTransactionInput.cardId
  }

  payment.recurrencyId = updateRecurrencyTransactionInput.recurrencyId;

  const variables = {
      input: {
        ...payment
      }
  };

  try {

    const res = await fetchPaymentsService(query, variables);

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.updateRecurrencyTransaction

  } catch (error) {
    throw new Error(error.message);
  }

}

export default {
  createSubscribe,
  removeCardById,
  getSubscriptionTransactions,
  getSubscriptionByOrganizationId,
  updateRecurrencyTransaction,
  saveOrganizationCreditCard,
  listAvailablePlans,
  listCardsByOrganizationId
}