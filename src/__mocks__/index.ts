import Faker from 'faker'
import { Integrations } from '../services/integration/types'

export const createOrganizationPayload = () => ({
  organization: {
    name: Faker.name.firstName(),
    contactEmail: 'gabriel-tamura@b8one.com',
    phone: '551123213123123',
  },
  additionalInfos: {
    segment: 'Beleza e Cosméticos',
    resellersEstimate: 500,
    reason: 'Ter mais uma opção de canal de vendas',
    plataform: 'vtex',
  },
})

export const createOrganizationWithIntegrationVTEXPayload = () => ({
  organization: {
    name: Faker.name.firstName(),
    contactEmail: 'gabriel-tamura@b8one.com',
    phone: '551123213123123',
  },
  additionalInfos: {
    segment: 'Beleza e Cosméticos',
    resellersEstimate: 500,
    reason: 'Ter mais uma opção de canal de vendas',
    plataform: 'vtex',
  },
  integration: {
    ...vtexSecretsMock,
  },
})

export const mockVtexDepartments = [
  {
    id: 1,
    name: 'Mercearia',
    hasChildren: true,
    url: 'https://beightoneagency.vtexcommercestable.com.br/mercearia',
    children: [[Object], [Object], [Object]],
    Title: 'Mercearia',
    MetaTagDescription: 'Mercearia',
  },
  {
    id: 5,
    name: 'Padaria',
    hasChildren: true,
    url: 'https://beightoneagency.vtexcommercestable.com.br/padaria',
    children: [[Object], [Object], [Object]],
    Title: '',
    MetaTagDescription: '',
  },
  {
    id: 10,
    name: 'Hortifrúti',
    hasChildren: true,
    url: 'https://beightoneagency.vtexcommercestable.com.br/hortifruti',
    children: [[Object], [Object]],
    Title: 'Hortifrúti',
    MetaTagDescription: 'Nosso Hortifrúti tem o melhor e mais fresco de alimentos  saudáveis.',
  },
  {
    id: 13,
    name: 'Bebidas',
    hasChildren: true,
    url: 'https://beightoneagency.vtexcommercestable.com.br/bebidas',
    children: [[Object], [Object], [Object]],
    Title: 'Bebidas',
    MetaTagDescription: 'Quer garantir as melhores bebidas, confira nossa seleção.',
  },
  {
    id: 17,
    name: 'Pet',
    hasChildren: true,
    url: 'https://beightoneagency.vtexcommercestable.com.br/pet',
    children: [[Object], [Object]],
    Title: 'Para o seu Pet',
    MetaTagDescription: 'Tudo que seu pet precisa temos aqui.',
  },
  {
    id: 20,
    name: 'Higiene e Beleza',
    hasChildren: true,
    url: 'https://beightoneagency.vtexcommercestable.com.br/higiene-e-beleza',
    children: [[Object], [Object]],
    Title: 'Cuidados pessoais',
    MetaTagDescription: '',
  },
  {
    id: 24,
    name: 'Chocolate',
    hasChildren: false,
    url: 'https://beightoneagency.vtexcommercestable.com.br/chocolate',
    children: [],
    Title: '',
    MetaTagDescription: '',
  },
]

export const vtexSecretsMock = {
  secrets: {
    xVtexApiAppKey: 'vtexappkey-beightoneagency-NQFTPH',
    xVtexApiAppToken: 'UGQTSFGUPUNOUCZKJVKYRSZHGMWYZXBPCVGURKHVIUMZZKNVUSEAHFFBGIMGIIURSYLZWFSZOPQXFAIWYADGTBHWQFNJXAMAZVGBZNZPAFLSPHVGAQHHFNYQQOJRRIBO',
    accountName: 'beightoneagency',
  },
  type: Integrations.VTEX,
}

export { default as IntegrationSecretMock } from './integration-secret'
export { default as OrganizationMock } from './organization'
export { default as OrganizationAdditionalInfosMock } from './organization-additional-infos'
export { default as OrganizationIntegrationSecretMock } from './organization-integration-secret-mock'
export { default as OrganizationServiceMock } from './organization-service'
export { default as UserMock } from './user'
export { default as UserOrganizationMock } from './user-organization'
export { default as UserOrganizationRoleMock } from './users-organization-roles'
export { default as UserOrganizationServiceRolesMock } from './users-organization-service-role'
