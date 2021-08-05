import HublyInvoiceData from '../models/HublyInvoiceData'
import { IGetInvoiceInput, IStoreHublyInvoice, IUpdateHublyInvoice } from "../types";

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

  console.log({payload})

  return null
}

export default {
  storeInvoice,
  updateInvoice,
  getInvoice
}