import { reduce, merge } from 'lodash';
import services from './services';
import moment from 'moment';
import { GraphQLScalarType } from 'graphql';
import { mergeTypes } from 'merge-graphql-schemas';
import { gql, IResolvers, IDirectiveResolvers } from 'apollo-server';
import { GraphQLUpload } from 'graphql-upload';
import jwt from 'jsonwebtoken';
import knexDatabase from './knex-database';

declare var process : {
	env: {
	  JWT_SECRET: string
	}
}

const typeDefsBase = gql`
  type Query{
    _empty: String
  }
  type Mutation{
    _empty: String
  }
  scalar Date
  scalar Datetime
  scalar Upload
  directive @hasRole(role: [String]!) on FIELD | FIELD_DEFINITION
  directive @isAuthenticated on FIELD | FIELD_DEFINITION
  directive @isVerified on FIELD | FIELD_DEFINITION
`;

const resolversBase : IResolvers = {
  Query: {
    _empty: () => ""
  },
  Mutation: {
    _empty: () => ""
  },
  Upload: GraphQLUpload,
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value : any) {
      let dt = moment(value);
      if(!dt.isValid()) {
        throw new Error(`Invalid Date value: ${value}`);
      }
      return dt; // value from the client
    },
    serialize(value : any) {
      let momentD = moment(value)
      return momentD.format('YYYY-MM-DD'); // value sent to the client
    },
    parseLiteral(ast: any) {
      let dt = moment(ast.value);
      if(!dt.isValid()) {
        throw new Error(`Invalid Date value: ${ast.value}`);
      }
      return dt;
    },
  }),
  Datetime: new GraphQLScalarType({
    name: 'Datetime',
    description: 'Date custom scalar type',
    parseValue(value) {
      let dt = moment(value);
      if(!dt.isValid()) {
        throw new Error(`Invalid Date value: ${value}`);
      }
      return dt; // value from the client
    },
    serialize(value) {
      return value.toISOString(); // value sent to the client
    },
    parseLiteral(ast : any) {
      let dt = moment(ast.value);
      if(!dt.isValid()) {
	       throw new Error(`Invalid Date value: ${ast.value}`);
      }
      return dt;
    },
  })
};

const directiveResolvers : IDirectiveResolvers = {
  async hasRole(next, _, args): Promise<any> {
    const userRoles = ["MANAGER"] //return roles
    const hasSpecifiedRole = userRoles.some((role : string) => args.role.includes(role));
    if (hasSpecifiedRole) return next();
    throw new Error(`Must have role: ${args.role}, you have role: ${userRoles}`)
  },
  async isAuthenticated(next, _, __, context) {
    const token = context.headers['x-api-token'];
    if (!token) throw new Error("token must be provided!");
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
      context.client = decoded;
      return next();
    } catch (err) {
      throw new Error("You are not authorized.");
    }
  },
  async isVerified(next, _, __, context) {
    const [user] = await knexDatabase.knex('users').where('id', context.client.id).select();
    if(!user.verified) throw new Error("you need verify your email!")
    return next();
  }
};

const typeDefs = gql`${mergeTypes([typeDefsBase].concat(services.apis.graphql.typeDefs))}`;
const resolvers = merge(resolversBase, services.apis.graphql.resolvers);

export default {
  typeDefs,
  resolvers,
  directiveResolvers
};
