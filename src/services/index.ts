import { reduce, merge } from 'lodash';

import UserService from './users';
import AuthenticationService from './authentication';

let services = [
  UserService,
  AuthenticationService
];

export default {
  apis: {
    graphql: {
      typeDefs: services.map(s => s.apis.graphql.typeDefs),
      resolvers: reduce(services, (acc, s) => merge(acc, s.apis.graphql.resolvers), {}),
    }
  }
};
