import { NextFunction, Request, Response } from 'express'
import OrganizationService from '../services/organization/service'
import IntegrationService from '../services/integration/service'
import {} from '../services/'
import knexDatabase from '../knex-database'
import Axios from 'axios'

export default async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-plugone-api-token']
  const { orderId } = req.params
  const { organizationId } = req.query
  const ordersServiceUrl = process.env.ORDER_SERVICE_URL

  knexDatabase.knexConfig.transaction(async (trx) => {

    const apiKey  = await OrganizationService.getOrganizationApiKey({
      organizationId: organizationId as string, 
    }, trx)

    if (token !== apiKey) {
      return res.status(401).send({ error: "api key inexistent" })
    }
  
    const url = `${ordersServiceUrl}/organization/${organizationId}/orders/${orderId}`

    try {
      const { data } = await Axios.get(url)

      res.locals.body = data

      next()
    } catch (error) {
      return res.status(500).send(error)
    }
  })
}