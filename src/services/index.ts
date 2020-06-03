import { reduce, merge } from 'lodash';

import UserService from './users';
import AuthenticationService from './authentication';
import OrganizationService from './organization';
import ServicesService from './services';
import VtexService from './vtex';
import ShortenerUrlService from './shortener-url';
import AffiliateService from './affiliate';

let services = [
  UserService,
  ShortenerUrlService,
  AuthenticationService,
  OrganizationService,
  ServicesService,
  VtexService,
  AffiliateService
];

export default {
  apis: {
    graphql: {
      typeDefs: services.map(s => s.apis.graphql.typeDefs),
      resolvers: reduce(services, (acc, s) => merge(acc, s.apis.graphql.resolvers), {}),
    }
  }
};
