import { ICreateSubscribe, PaymentMethod, IUpdateSubscribe } from "../types";
import Axios from "axios";
import { PAYMENTS_URL } from '../../../common/consts';

export const paymentFactory = (payment: ICreateSubscribe) => {
    switch (payment.paymentMethod) {
        case PaymentMethod.boleto:
            return {
                organizationId: payment.organizationId,
                planId: payment.plan,
                paymentMethod: payment.paymentMethod,
                customer: {
                    email: payment.contactEmail
                }
            }
        case PaymentMethod.credit_card:
            return {
                organizationId: payment.organizationId,
                planId: payment.plan,
                cardId: '',
                paymentMethod: payment.paymentMethod,
                billing: {
                  name: payment.billing?.name,
                  address:{
                    street: payment.billing?.address.street,
                    complementary: payment.billing?.address.complementary,
                    state: payment.billing?.address.state,
                    streetNumber: payment.billing?.address.streetNumber,
                    neighborhood: payment.billing?.address.neighborhood,
                    city: payment.billing?.address.city,
                    zipcode: payment.billing?.address.zipcode,
                    country: payment.billing?.address.country
                  }
                },
                customer: {
                  documentNumber: payment.customer?.documentNumber
                }
              }
        default: return {};
    }
}

export const updatePaymentsFactory = (payment: IUpdateSubscribe) : any => {
    switch (payment.paymentMethod) {
        case PaymentMethod.boleto:
            return {
                organizationId: payment.organizationId,
                planId: payment.plan,
                paymentMethod: payment.paymentMethod,
                customer: {
                    email: payment.contactEmail
                }
            }
        case PaymentMethod.credit_card:
            return {
                organizationId: payment.organizationId,
                planId: payment.plan,
                cardId: payment.cardId,
                paymentMethod: payment.paymentMethod,
              }
        default: return {};
    }
}

export const fetchPaymentsService = async (query: string, variables?: any) => {

  const payload = {
    query,
    variables
  }

  const res = await Axios.post(PAYMENTS_URL, payload, {
    headers: { "Content-Type": 'application/json' }
  })

  return res

}