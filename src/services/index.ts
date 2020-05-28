import { reduce, merge } from 'lodash';

import UserService from './users';
import AuthenticationService from './authentication';
import OrganizationService from './organization';
import ServicesService from './services';
import VtexService from './vtex';

let services = [
  UserService,
  AuthenticationService,
  OrganizationService,
  ServicesService,
  VtexService
];

export default {
  apis: {
    graphql: {
      typeDefs: services.map(s => s.apis.graphql.typeDefs),
      resolvers: reduce(services, (acc, s) => merge(acc, s.apis.graphql.resolvers), {}),
    }
  }
};
