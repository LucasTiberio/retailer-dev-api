import { reduce, merge } from 'lodash'

import UserService from './users'
import AuthenticationService from './authentication'
import OrganizationService from './organization'
import ServicesService from './services'
import VtexService from './vtex'
import ShortenerUrlService from './shortener-url'
import AffiliateService from './affiliate'
import OrganizationPermissionService from './organization-permissions'
import ServicePermissionService from './service-permissions'
import MenuService from './menu'
import BankDataService from './bank-data'
import PaymentsService from './payments'
import IntegrationsService from './integration'
import AffiliateStoreService from './affiliate-store'
import InsideSalesService from './inside-sales'
import PersonalizedComissions from './personalized-commissions'
import TermsAndConditionService from './terms-and-conditions'
import CommissionBonification from './commission-bonification'

let services = [
  CommissionBonification,
  TermsAndConditionService,
  IntegrationsService,
  UserService,
  ShortenerUrlService,
  AuthenticationService,
  OrganizationService,
  ServicesService,
  VtexService,
  AffiliateService,
  OrganizationPermissionService,
  ServicePermissionService,
  MenuService,
  BankDataService,
  PaymentsService,
  AffiliateStoreService,
  InsideSalesService,
  PersonalizedComissions,
]

export default {
  apis: {
    graphql: {
      typeDefs: services.map((s) => s.apis.graphql.typeDefs),
      resolvers: reduce(services, (acc, s) => merge(acc, s.apis.graphql.resolvers), {}),
    },
  },
}
