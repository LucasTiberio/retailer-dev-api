import { ICreateSubscribe, PaymentMethod, ISaveCreditCard } from './types';
import { paymentFactory } from './helpers';
import Axios from 'axios';
import { PAYMENTS_URL } from '../../common/consts';

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

    const payload = {
      query: query,
      variables: variables
    }

    const res = await Axios.post(PAYMENTS_URL, payload, {
      headers: { "Content-Type": 'application/json' }
    })

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

  const payload = {
    query: query,
    variables: variables
  }

  try {

    const res = await Axios.post(PAYMENTS_URL, payload, {
      headers: { "Content-Type": 'application/json' }
    })

    if(res.data?.errors){
      throw new Error(res.data.errors[0].message)
    }
  
    return res.data.data.saveOrganizationCreditCard
  
  } catch (error) {
    throw new Error(error.message);
  }

}

export default {
  createSubscribe
}