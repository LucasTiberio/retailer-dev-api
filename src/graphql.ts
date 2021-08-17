import { merge } from 'lodash'
import services from './services'
import moment from 'moment'
import { GraphQLScalarType, GraphQLError } from 'graphql'
import { mergeTypes } from 'merge-graphql-schemas'
import { gql, IResolvers, IDirectiveResolvers } from 'apollo-server'
import { FileUpload } from 'graphql-upload'
import jwt from 'jsonwebtoken'
import * as FileType from 'file-type'
import knexDatabase from './knex-database'
import { NextFunction } from 'express'
import { sortBy } from 'lodash'
import { IOrganizationRoleResponse, OrganizationRoles } from './services/organization/types'
import redisClient from './lib/Redis'
import { SALE_VTEX_PIXEL_NAMESPACE, MESSAGE_ERROR_SALE_TOKEN_INVALID, MESSAGE_ERROR_USER_NOT_ORGANIZATION_FOUNDER } from './common/consts'
import PaymentService from './services/payments/service'
import IntegrationService from './services/integration/service'
import { PaymentServiceStatus } from './services/payments/types'
import { Integrations } from './services/integration/types'
import { organizationsPlanDoesNotHaveAffiliateStore, onlyIuguIntegrationFeature, onlyVtexIntegrationFeature, userDoesNotAcceptTermsAndConditions, organizationHasBillingDependency } from './common/errors'
import TermsAndConditionsService from './services/terms-and-conditions/service'
import OrganizationRulesService from './services/organization-rules/service'
import { InviteStatus } from './services/users-organizations/types'

declare var process: {
  env: {
    JWT_SECRET: string
    NODE_ENV: 'test' | 'production' | 'staging'
    ORDERS_SERVICE_PASSWORD: string
    ENTERPRISE_TOKEN: string
  }
}

const typeDefsBase = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
  scalar Date
  scalar Datetime
  scalar Upload
  directive @acceptTermsAndConditions on FIELD | FIELD_DEFINITION
  directive @hasOrganizationRole(role: [String]!) on FIELD | FIELD_DEFINITION
  directive @isAuthenticated on FIELD | FIELD_DEFINITION
  directive @organizationPaidVerify on FIELD | FIELD_DEFINITION
  directive @asOrganizationFounder on FIELD | FIELD_DEFINITION
  directive @ordersService on FIELD | FIELD_DEFINITION
  directive @hasEnterpriseToken on FIELD | FIELD_DEFINITION
  directive @vtexFeature on FIELD | FIELD_DEFINITION
  directive @lojaIntegradaFeature on FIELD | FIELD_DEFINITION
  directive @hasIntegration on FIELD | FIELD_DEFINITION
  directive @hasSalesToken on FIELD | FIELD_DEFINITION
  directive @SaasIntegration on FIELD | FIELD_DEFINITION
  directive @isVerified on FIELD | FIELD_DEFINITION
  directive @hasServiceRole(role: [String]!, serviceName: String) on FIELD | FIELD_DEFINITION
  directive @hasAffiliateStore on FIELD | FIELD_DEFINITION
  directive @validUser on FIELD | FIELD_DEFINITION
  directive @enterpriseFeature on FIELD | FIELD_DEFINITION
  directive @enterpriseOrNeptuneFeature on FIELD | FIELD_DEFINITION
  directive @hasAbandonedCart on FIELD | FIELD_DEFINITION
`

const resolversBase: IResolvers = {
  Query: {
    _empty: () => '',
  },
  Mutation: {
    _empty: () => '',
  },
  // Upload: new GraphQLScalarType({
  Upload: new GraphQLScalarType({
    name: 'Upload',
    description: 'The `Upload` scalar type represents a file upload.',
    async parseValue(value: Promise<FileUpload>): Promise<FileUpload> {
      const upload = await value
      const stream = upload.createReadStream()
      const fileType = await FileType.fromStream(stream)

      if (fileType?.mime !== upload.mimetype) throw new GraphQLError('Mime type does not match file content.')

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
    parseValue(value: any) {
      let dt = moment(value)
      if (!dt.isValid()) {
        throw new Error(`Invalid Date value: ${value}`)
      }
      return dt // value from the client
    },
    serialize(value: any) {
      let momentD = moment(value)
      return momentD.format('YYYY-MM-DD') // value sent to the client
    },
    parseLiteral(ast: any) {
      let dt = moment(ast.value)
      if (!dt.isValid()) {
        throw new Error(`Invalid Date value: ${ast.value}`)
      }
      return dt
    },
  }),
  Datetime: new GraphQLScalarType({
    name: 'Datetime',
    description: 'Date custom scalar type',
    parseValue(value) {
      let dt = moment(value)
      if (!dt.isValid()) {
        throw new Error(`Invalid Date value: ${value}`)
      }
      return dt // value from the client
    },
    serialize(value) {
      return value.toISOString() // value sent to the client
    },
    parseLiteral(ast: any) {
      let dt = moment(ast.value)
      if (!dt.isValid()) {
        throw new Error(`Invalid Date value: ${ast.value}`)
      }
      return dt
    },
  }),
}

const directiveResolvers: IDirectiveResolvers = {
  async hasServiceRole(next, _, args: any, context, other: any): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Organization identifier invalid!')

    const userOrganizationRoles = await knexDatabase
      .knexConfig('users as usr')
      .where('usr.id', context.client.id)
      .andWhere('uo.organization_id', organizationId)
      .innerJoin('users_organizations AS uo', 'uo.user_id', 'usr.id')
      .innerJoin('users_organization_roles as uor', 'uo.id', 'uor.users_organization_id')
      .innerJoin('organization_roles as or', 'uor.organization_role_id', 'or.id')
      .select('or.name', 'uo.id AS users_organizations_id')

    const hasSpecifiedRole = userOrganizationRoles.filter((role: IOrganizationRoleResponse) => role.name === OrganizationRoles.ADMIN)

    if (hasSpecifiedRole.length) {
      context.organizationId = organizationId
      context.isOrganizationAdmin = true
      return next()
    }

    let serviceName = other.variableValues.input?.serviceName || args.serviceName

    if (!serviceName) {
      const fields = other.fieldNodes[0].arguments[0].value.fields
      const serviceNameField = fields.filter((el: any) => el.name.value === 'serviceName')
      serviceName = serviceNameField[0].value.value
    }

    if (!serviceName) throw new Error('service identifier invalid!')

    if (!userOrganizationRoles.length) throw new Error('User not found in organization.')

    const userServiceOrganizationRoles = await knexDatabase
      .knexConfig('users_organization_service_roles as uosr')
      .where('uosr.users_organization_id', userOrganizationRoles[0].users_organizations_id)
      .innerJoin('service_roles AS sr', 'sr.id', 'uosr.service_roles_id')
      .select('sr.name', 'uosr.id')

    const hasSpecifiedServiceRole = userServiceOrganizationRoles.some((role: IOrganizationRoleResponse) => args.role.includes(role.name))
    if (hasSpecifiedServiceRole) {
      context.organizationId = organizationId
      context.isOrganizationAdmin = false
      context.userServiceOrganizationRolesId = userServiceOrganizationRoles[0].id
      return next()
    }
    throw new Error(`Must have role: ${args.role}, you have role: ${userServiceOrganizationRoles.map((item: IOrganizationRoleResponse) => item.name)}`)
  },
  async hasOrganizationRole(next, _, args: any, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Invalid session!')

    const userOrganizationRoles = await knexDatabase
      .knexConfig('users as usr')
      .where('usr.id', context.client.id)
      .andWhere('uo.organization_id', organizationId)
      .andWhere('uo.active', true)
      .innerJoin('users_organizations AS uo', 'uo.user_id', 'usr.id')
      .innerJoin('users_organization_roles as uor', 'uo.id', 'uor.users_organization_id')
      .innerJoin('organization_roles as or', 'uor.organization_role_id', 'or.id')
      .innerJoin('organizations as org', 'uo.organization_id', 'org.id')
      .select('or.name', 'org.slug')

    const hasSpecifiedRole = userOrganizationRoles.some((role: IOrganizationRoleResponse) => args.role.includes(role.name))
    if (hasSpecifiedRole) {
      context.organizationId = organizationId
      context.organizationSlug = userOrganizationRoles[0].slug
      context.organizationRoles = userOrganizationRoles.map(({ name }) => name)
      return next()
    } else {
      throw new Error(`Must have role: ${args.role}, you have role: ${userOrganizationRoles.map((item: IOrganizationRoleResponse) => item.name)}`)
    }
  },
  async isAuthenticated(next, _, __, context): Promise<NextFunction> {
    const token = context.headers['x-api-token']
    if (!token) throw new Error('token must be provided!')

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      context.client = decoded
      const organizationId = await redisClient.getAsync(context.client.id)
      if (organizationId) {
        context.organizationId = organizationId
      }
      return next()
    } catch (err) {
      throw new Error('You are not authorized.')
    }
  },
  async acceptTermsAndConditions(next, _, __, context): Promise<NextFunction> {
    const cachedTermsAndConditions = await redisClient.getAsync(`termsAndConditions_${context.client.id}`)

    if (cachedTermsAndConditions) {
      return next()
    }

    const validTermsAndConditions = await TermsAndConditionsService.getTermsAndConditions({
      client: {
        id: context.client.id,
      },
      headers: context.headers.origin
    })

    if (!validTermsAndConditions) return next()

    if (validTermsAndConditions?.status) {
      await redisClient.setAsync(`termsAndConditions_${context.client.id}`, validTermsAndConditions?.status, 'EX', 86400)
      return next()
    }

    throw new Error(userDoesNotAcceptTermsAndConditions)
  },
  async vtexFeature(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Organization identifier invalid!')

    const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

    if (integration.type !== Integrations.VTEX) {
      throw new Error(onlyVtexIntegrationFeature)
    }

    context.secret = integration.secret
    return next()
  },
  async lojaIntegradaFeature(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Organization identifier invalid!')

    const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

    if (integration.type !== Integrations.LOJA_INTEGRADA) {
      throw new Error('only_loja_integrada_feature')
    }

    context.secret = integration.secret
    return next()
  },
  async hasIntegration(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Organization identifier invalid!')

    const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

    if (integration.type !== Integrations.VTEX && integration.type !== Integrations.LOJA_INTEGRADA) {
      throw new Error('Organization doesnt have integrations')
    }

    context.secret = integration.secret
    return next()
  },
  async SaasIntegration(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Organization identifier invalid!')

    const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

    if (integration.type === Integrations.IUGU || integration.type === Integrations.KLIPFOLIO) {
      context.secret = integration.secret
      return next()
    }

    throw new Error(onlyIuguIntegrationFeature)
  },
  async hasEnterpriseToken(next, _, __, context): Promise<NextFunction> {
    const token = context.headers['token']
    if (!token) throw new Error('token must be provided!')

    if (token !== process.env.ENTERPRISE_TOKEN) {
      throw new Error('Invalid Token')
    }

    return next()
  },
  async organizationPaidVerify(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Invalid session!')

    const [organization] = await knexDatabase.knexConfig('organizations').where('id', organizationId).select('free_trial', 'free_trial_expires', 'free_plan')

    if (!organization) throw new Error('Organization not found.')

    if (organization.free_plan) return next()

    if (moment(organization.free_trial_expires).isAfter(moment())) {
      return next()
    } else {
      const paymentServiceStatus = await PaymentService.getSubscriptionByOrganizationId(organizationId)

      if (paymentServiceStatus && moment(paymentServiceStatus.expiresAt).add(10, 'days').isAfter(moment())) {
        return next()
      }

      if (paymentServiceStatus && !paymentServiceStatus.expiresAt) {
        const pendingInvoices = paymentServiceStatus.recentInvoices.filter((item: { dueData: string; status: PaymentServiceStatus }) => item.status === PaymentServiceStatus.PENDING)

        const [oldPendingInvoice] = sortBy(
          pendingInvoices,
          function (dateObj) {
            return new Date(dateObj.dueDate)
          },
          'desc'
        )

        const inadimplence = moment().diff(moment(oldPendingInvoice.dueDate), 'days')

        if (inadimplence < 10) {
          return next()
        }
      }
    }

    throw new Error(organizationHasBillingDependency)
  },
  async asOrganizationFounder(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Invalid session!')

    const [organizationFounder] = await knexDatabase.knexConfig('organizations').where('user_id', context.client.id).select('id')

    if (!organizationFounder) throw new Error(MESSAGE_ERROR_USER_NOT_ORGANIZATION_FOUNDER)

    context.organizationId = organizationId
    return next()
  },
  async hasAbandonedCart(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Invalid session!')

    const organization = await knexDatabase.knexConfig('organizations').where('id', organizationId).first().select('abandoned_cart')

    if (!organization.abandoned_cart) throw new Error('organization_does_not_have_abandoned_cart_active')

    return next()
  },
  async ordersService(next, _, __, context): Promise<NextFunction> {
    const token = context.headers['token']
    if (!token) throw new Error('token must be provided!')

    if (token !== process.env.ORDERS_SERVICE_PASSWORD) {
      throw new Error('Invalid Token')
    }

    return next()
  },
  async hasSalesToken(next, _, __, context): Promise<NextFunction> {
    const salesToken = context.headers['sales-token']

    const salesVerified = await redisClient.getAsync(`${SALE_VTEX_PIXEL_NAMESPACE}_${salesToken}`)

    if (!salesVerified) throw new Error(MESSAGE_ERROR_SALE_TOKEN_INVALID)

    context.salesId = salesVerified

    return next()
  },
  async isVerified(next, _, __, context): Promise<NextFunction> {
    const [user] = await knexDatabase.knexConfig('users').where('id', context.client.id).select()
    if (!user) throw new Error('user_not_found')
    if (!user.verified) throw new Error('verify_your_email')
    return next()
  },
  async hasAffiliateStore(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)

    if (!organizationId) throw new Error('Organization identifier invalid!')

    const integration = await IntegrationService.getIntegrationByOrganizationId(organizationId)

    if (integration.type === Integrations.IUGU || integration.type === Integrations.KLIPFOLIO) throw new Error('Iugu does not have access to affiliate store')

    const paymentServiceStatus = await OrganizationRulesService.getAffiliateTeammateRules(organizationId)
    const organizationPlanHasAffiliateStore = paymentServiceStatus.affiliateStore

    if (integration.type === Integrations.VTEX || (integration.type === Integrations.LOJA_INTEGRADA && organizationPlanHasAffiliateStore)) {
      // context.secret = integration.secret
      // context.organizationId = organizationId;

      return next()
    }

    throw new Error(organizationsPlanDoesNotHaveAffiliateStore)
  },
  async validUser(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)
    const userId = context.client.id
    if (!organizationId) throw new Error('Organization identifier invalid!')
    const user = await knexDatabase.knexConfig('users_organizations').where('user_id', userId).andWhere('organization_id', organizationId).first().select('invite_status')
    if (user.invite_status === InviteStatus.accept) {
      return next()
    }

    throw new Error('User has pending or rejected affiliation')
  },
  async enterpriseFeature(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)
    const planType = await OrganizationRulesService.getPlanType(organizationId)
    if (planType === 'Enterprise') {
      return next()
    }

    throw new Error('This feature is available only on enterprise plans')
  },
  async enterpriseOrNeptuneFeature(next, _, __, context): Promise<NextFunction> {
    const organizationId = await redisClient.getAsync(context.client.id)
    const planType = await OrganizationRulesService.getPlanType(organizationId)
    if (planType === 'Enterprise' || planType === 'Neptune') {
      return next()
    }

    throw new Error('This feature is available only on enterprise plans')
  },
}

const typeDefs = gql`
  ${mergeTypes([typeDefsBase].concat(services.apis.graphql.typeDefs))}
`
const resolvers = merge(resolversBase, services.apis.graphql.resolvers)

export default {
  typeDefs,
  resolvers,
  directiveResolvers,
}
