import GraphQLAPI from './graphql';
import store from './store';
import { ApolloServer, makeExecutableSchema } from 'apollo-server-express';

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: GraphQLAPI.typeDefs,
    resolvers: GraphQLAPI.resolvers,
    directiveResolvers: GraphQLAPI.directiveResolvers
  }),
  uploads: {
    maxFileSize: 700000,
    maxFiles: 1,
    maxFieldSize: 700000
  },
  context: ({req}) => {
    store.resetStores();
    return {
      headers: req.headers
    }
  },
  introspection: true,
  playground: true
});

export default server;
