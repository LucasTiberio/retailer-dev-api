import { NextFunction, Request, Response } from 'express'
import OrganizationService from '../services/organization/service'
import UsersOrganizationServiceRoleRepository, {  } from '../services/finantial-conciliation/repository/users_organization_service_roles'
import { } from '../services/'
import knexDatabase from '../knex-database'
import { IDocumentType } from '../services/users/types'
import { IAffiliate } from '../services/finantial-conciliation/types'

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-plugone-api-token']
  const { documentType, document, organizationId, page = 1, perPage = 20 } = req.query

  knexDatabase.knexConfig.transaction(async (trx) => {

    const apiKey = await OrganizationService.getOrganizationApiKey({
      organizationId: organizationId as string,
    }, trx)
    if (token !== apiKey) {
      return res.status(401).send({ error: "api key inexistent" })
    }

    try {
      const affiliates = await UsersOrganizationServiceRoleRepository.getAffiliates(organizationId as string, page as number, perPage as number, {
        document: document as string,
        documentType: documentType as IDocumentType
      }, trx);

      const affiliatewithutms = affiliates.data.map((affiliate: IAffiliate) => {
        return {
          ...affiliate,
          utm: `${affiliate.organization_id}_${affiliate.affiliate_id}`
        }
      });
      
      res.locals.body = {
        affiliates: affiliatewithutms,
        pagination: affiliates.pagination
      }
      next()
    } catch (error) {
      return res.status(500).send(error)
    }
  })
}