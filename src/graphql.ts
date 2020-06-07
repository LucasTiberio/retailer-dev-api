import { merge } from 'lodash';
import services from './services';
import moment from 'moment';
import { GraphQLScalarType, GraphQLError } from 'graphql';
import { mergeTypes } from 'merge-graphql-schemas';
import { gql, IResolvers, IDirectiveResolvers } from 'apollo-server';
import { FileUpload } from 'graphql-upload';
import jwt from 'jsonwebtoken';
import * as FileType from 'file-type'
import knexDatabase from './knex-database';
import { NextFunction } from 'express';
import { IOrganizationRoleResponse, OrganizationRoles, OrganizationInviteStatus } from './services/organization/types';
import redisClient from './lib/Redis';

declare var process : {
	env: {
    JWT_SECRET: string
    NODE_ENV: 'test' | 'production' | 'staging'
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
  directive @hasOrganizationRole(role: [String]!) on FIELD | FIELD_DEFINITION
  directive @isAuthenticated on FIELD | FIELD_DEFINITION
  directive @isVerified on FIELD | FIELD_DEFINITION
  directive @hasServiceRole(role: [String]!) on FIELD | FIELD_DEFINITION  
`;

const resolversBase : IResolvers = {
  Query: {
    _empty: () => ""
  },
  Mutation: {
    _empty: () => ""
  },
  // Upload: new GraphQLScalarType({
  Upload: new GraphQLScalarType({
    name: 'Upload',
    description: 'The `Upload` scalar type represents a file upload.',
    async parseValue(value: Promise<FileUpload>): Promise<FileUpload> {
      const upload = await value
      const stream = upload.createReadStream()
      const fileType = await FileType.fromStream(stream)

      if (fileType?.mime !== upload.mimetype)
        throw new GraphQLError('Mime type does not match file content.')
  
      return upload
    },
    parseLiteral(ast): void {
      throw new GraphQLError('Upload literal unsupported.', ast)
    },
    serialize(): void {
      throw new GraphQLError('Upload serialization unsupported.')
    },
  }),
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
  async hasServiceRole(next, _, args : any, context, other : any): Promise<NextFunction> {

  const organizationId = await redisClient.getAsync(context.client.id);

  if(!organizationId) throw new Error("Organization identifier invalid!")

  const userOrganizationRoles = await knexDatabase.knex('users as usr')
  .where('usr.id', context.client.id)
  .andWhere('uo.organization_id', organizationId)
  .innerJoin('users_organizations AS uo', 'uo.user_id', 'usr.id')
  .innerJoin('users_organization_roles as uor', 'uo.id', 'uor.users_organization_id')
  .innerJoin('organization_roles as or', 'uor.organization_role_id', 'or.id')
  .select('or.name', 'uo.id AS users_organizations_id');

  const hasSpecifiedRole = userOrganizationRoles.filter((role: IOrganizationRoleResponse ) => role.name === OrganizationRoles.ADMIN);

  if (hasSpecifiedRole.length) {
    context.organizationId = organizationId;
    context.isOrganizationAdmin = true;
    return next()
  };

  let serviceName: string;

  if(process.env.NODE_ENV === 'test'){
    serviceName = other.variableValues.input.serviceName;

    if(!serviceName) throw new Error("service identifier invalid!")

  } else {
    const fields = other.fieldNodes[0].arguments[0].value.fields;
    const serviceNameField = fields.filter((el : any) => el.name.value === 'serviceName');
  
    if(!serviceNameField.length) throw new Error("service identifier invalid!")
  
    serviceName = serviceNameField[0].value.value;
  }

  if(!userOrganizationRoles.length) throw new Error("User not found in organization.")

  const userServiceOrganizationRoles = await knexDatabase.knex('users_organization_service_roles as uosr')
    .where('uosr.users_organization_id', userOrganizationRoles[0].users_organizations_id)
  .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
  .select('sr.name');

  const hasSpecifiedServiceRole = userServiceOrganizationRoles.some((role: IOrganizationRoleResponse ) => args.role.includes(role.name));
  if (hasSpecifiedServiceRole) {
    context.organizationId = organizationId;
    context.isOrganizationAdmin = false;
    return next()
  };
  throw new Error(`Must have role: ${args.role}, you have role: ${userServiceOrganizationRoles.map((item: IOrganizationRoleResponse) => item.name)}`)
  },
  async hasOrganizationRole(next, _, args : any, context): Promise<NextFunction>{

    const organizationId = await redisClient.getAsync(context.client.id);

    if(!organizationId) throw new Error("Invalid session!");

    const userOrganizationRoles = await knexDatabase.knex('users as usr')
    .where('usr.id', context.client.id)
    .andWhere('uo.organization_id', organizationId)
    .andWhere('uo.active', true)
    .innerJoin('users_organizations AS uo', 'uo.user_id', 'usr.id')
    .innerJoin('users_organization_roles as uor', 'uo.id', 'uor.users_organization_id')
    .innerJoin('organization_roles as or', 'uor.organization_role_id', 'or.id')
    .select('or.name');

    const hasSpecifiedRole = userOrganizationRoles.some((role: IOrganizationRoleResponse ) => args.role.includes(role.name));
    if (hasSpecifiedRole) {
      context.organizationId = organizationId
      return next()
    } else {

      throw new Error(`Must have role: ${args.role}, you have role: ${userOrganizationRoles.map((item: IOrganizationRoleResponse) => item.name)}`)
    };

},
  async isAuthenticated(next, _, __, context): Promise<NextFunction> {
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
  async isVerified(next, _, __, context): Promise<NextFunction> {
    const [user] = await knexDatabase.knex('users').where('id', context.client.id).select();
    if(!user) throw new Error("user not found!");
    if(!user.verified) throw new Error("you need verify your email!");
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
