import HublyInvoiceData from '../models/HublyInvoiceData'
import { IGetInvoiceInput, IGetInvoicesInput, IStoreHublyInvoice, IUpdateHublyInvoice } from "../types";

const storeInvoice = async (input: IStoreHublyInvoice, ctx: { userId: string, organizationId: string }) => {
  const payload = await HublyInvoiceData.create({
    ...ctx,
    ...input,
  })

  if (payload) return true

  throw new Error('cannot_save_invoice')
}

const updateInvoice = async (input: IUpdateHublyInvoice) => {
  const { id, ...rest } = input

  const data = await HublyInvoiceData.findById(id)

  const payload = await data?.updateOne({ ...rest })

  if (payload) return true

  throw new Error('cannot_update_invoice')
}

export const getInvoice = async (input: IGetInvoiceInput, ctx: { userId: string; organizationId: string }) => {
  const payload = await HublyInvoiceData.findOne({
    ...ctx,
    ...input
  }).lean()

  if (payload) {
    return {
      ...payload,
      id: payload._id
    }
  }

  return null
}

export const getInvoices = async (input: IGetInvoicesInput, ctx: { userId: string; organizationId: string }) => {
  const payload = await HublyInvoiceData.find({
    ...ctx,
    ...input
  }).lean()

  console.log({payload, input, ctx})

  if (payload) {
    return payload.map(data => ({
      ...data,
      id: data._id
    }))
  }

  return []
}

export default {
  storeInvoice,
  updateInvoice,
  getInvoice,
  getInvoices
}