import { ICreateSubscribe, PaymentMethod } from "../types";

export const paymentFactory = (payment: ICreateSubscribe, cardId?: string) => {
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
                cardId: undefined,
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