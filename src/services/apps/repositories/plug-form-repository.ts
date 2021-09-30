import PlugFormData from '../models/PlugFormData'
import { IEditPlugFormInput, IGetPlugFormInput, IPlugFormData, IPlugFormDataInput } from '../types'

const getAll = async (ctx: { organizationId: string }) => {
  return PlugFormData.find({...ctx})
}

const savePlugFormFields = async (input: IPlugFormDataInput, ctx: { userId: string; organizationId: string }) => {
  if (!input.fields.length) {
    throw new Error('fields_not_filled')
  }

  const payload = await PlugFormData.create({ ...input, ...ctx })

  if (payload) return true

  throw new Error('could_not_save_fields')
}

const getPlugFormFields = async (ctx: { userId: string; organizationId: string }) => {
  const payload = await PlugFormData.findOne({ ...ctx }).lean()

  if (payload)
    return {
      ...payload,
      id: payload._id,
    }

  return null
}

const editPlugForm = async (input: IEditPlugFormInput) => {
  const payload = await PlugFormData.findOneAndUpdate(
    { _id: input.id },
    {...input}
  )

  if (payload) return true

  throw new Error('could_not_update_form')
}

export default {
  getAll,
  savePlugFormFields,
  getPlugFormFields,
  editPlugForm,
}
