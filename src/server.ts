import GraphQLAPI from './graphql';
import store from './store';
import jwt from 'jsonwebtoken';
import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-express';

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: GraphQLAPI.typeDefs,
    resolvers: GraphQLAPI.resolvers,
    directiveResolvers: GraphQLAPI.directiveResolvers
  }),
  context: ({req, connection}) => {
    store.resetStores();
    return {
      headers: req.headers
    }
  },
  introspection: true,
  playground: true
});

export default server;
