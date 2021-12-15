export interface ISignUp {
  username: string
  gender?: EUserGender
  birthDate?: string
  email: string
  password: string
  document: string
  documentType: IDocumentType
  phone: string
  position?: string
}

export interface IUsersDB {
  id: string
  username: string
  email: string
  password: string
  verification_hash: string
}

export interface ISimpleUser {
  id: string
  username: string
  email: string
}

export interface ISignUpFromDB {
  id: string
  username: string
  email: string
  password: string
  birth_date: string
  gender: EUserGender
  verification_hash: string
  document: string
  document_type: IDocumentType
  phone: string
  position: string
}

export enum IDocumentType {
  RG = 'rg',
  CPF = 'cpf',
  CNPJ = 'cnpj',
}

export interface ISignUpAdapted {
  id: string
  username: string
  email: string
}

export interface IChangePassword {
  password: string
  hash: string
}

export interface UserPendencies {
  pendency: EUserPendencies
  metadata?: string
}

export enum EUserPendencies {
  PLUG_FORM = 'PLUG_FORM',
  HUBLY_INVOICE = 'HUBLY_INVOICE'
}

export enum EUserGender {
  MALE = 'male',
  FEMALE = 'female',
  UNDEFINED = 'undefined'
}