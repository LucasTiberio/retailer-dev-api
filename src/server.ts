import GraphQLAPI from "./graphql";
import store from "./store";
import { ApolloServer, makeExecutableSchema } from "apollo-server-express";
import redisClient from "./lib/Redis";
import errorAdapter from "./utils/errorAdapter";

const server = new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs: GraphQLAPI.typeDefs,
    resolvers: GraphQLAPI.resolvers,
    directiveResolvers: GraphQLAPI.directiveResolvers,
  }),
  uploads: {
    maxFileSize: 700000,
    maxFiles: 1,
    maxFieldSize: 700000,
  },
  context: ({ req }) => {
    store.resetStores();
    return {
      headers: req.headers,
      redisClient,
    };
  },
  formatError: (error) => {
    const formattedError = errorAdapter(error.message);
    return {
      ...formattedError,
      message: error.message,
      stack: error?.extensions?.exception?.stacktrace,
    };
  },
  introspection: true,
  playground: true,
});

export default server;
