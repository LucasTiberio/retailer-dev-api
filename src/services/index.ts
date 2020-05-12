import { reduce, merge } from 'lodash';

import UserService from './users';
import AuthenticationService from './authentication';
import OrganizationService from './organization';
import ServicesService from './services';

let services = [
  UserService,
  AuthenticationService,
  OrganizationService,
  ServicesService
];

export default {
  apis: {
    graphql: {
      typeDefs: services.map(s => s.apis.graphql.typeDefs),
      resolvers: reduce(services, (acc, s) => merge(acc, s.apis.graphql.resolvers), {}),
    }
  }
};
