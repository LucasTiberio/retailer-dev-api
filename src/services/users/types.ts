export interface ISignUp {
  username: string
  email: string
  password: string
  document: string
  documentType: IDocumentType
  phone: string
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
  verification_hash: string
  document: string
  document_type: IDocumentType
  phone: string
}

export enum IDocumentType {
  RG = 'rg',
  CPF = 'cpf',
  cnpj = 'cnpj',
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
