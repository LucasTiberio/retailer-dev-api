export enum Plans {
  BASIC = "basic",
  PRO = "pro",
  BUSINESS = "business",
  ENTERPRISE = "enterprise",
}

export enum PaymentServiceStatus {
  PAID = "paid",
  PENDING = "pending",
}

export enum PaymentMethod {
  boleto = "bank_slip",
  credit_card = "credit_card",
}

export interface ICreditCard {
  number: string;
  holderName: string;
  expirationDate: string;
  cvv: string;
}

export interface Billing {
  name: string;
  address: Address;
}

export interface Address {
  street: string;
  complementary: string;
  state: string;
  streetNumber: string;
  neighborhood: string;
  city: string;
  zipcode: string;
  country: string;
}

export interface Customer {
  documentNumber?: string;
}

export interface IUpdateSubscribe {
  organizationId: string;
  recurrencyId?: string;
  plan: string;
  paymentMethod: PaymentMethod;
  contactEmail?: string;
  customer?: Customer;
  cardId?: string;
}

export interface ICreateSubscribe {
  organizationId: string;
  plan: string;
  creditCard: ICreditCard;
  paymentMethod: PaymentMethod;
  contactEmail: string;
  billing?: Billing;
  customer?: Customer;
}

export interface ISaveCreditCard {
  number: string;
  holderName: string;
  expirationDate: string;
  cvv: string;
  externalId: string;
}
