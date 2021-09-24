import { fetchWebhookService } from "../helpers"
import { IWebhookSubscriptions } from "../types"

const getAvailableWebhooks = async () => {
  const query = `
    query GetAvailableWebhooks{
      getAll {
        name,
        type,
        topics {
          name,
          description
        }
      }
    }`

  try {
    const res = await fetchWebhookService(query)

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message)
    }

    console.log({ res })

    return res.data.data.getAll
  } catch (error) {
    console.log(error)
    throw new Error(error.message)
  }
}

const getAllSubscriptions = async (
  input: { organizationId: string }
) => {
  const query = `
    query GetAllWebhookSubscriptions($input: GetAllSubscriptionsInput!){
      getAllWebhookSubscriptions(input: $input) {
        id
        organizationId
        enabledTopics
        status
        url
        description
      }
    }`

  const variables = {
    input
  }

  try {
    const res = await fetchWebhookService(query, variables)

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message)
    }

    console.log({ res })

    return res.data.data.getAllWebhookSubscriptions
  } catch (error) {
    console.log(error.response.data)
    throw new Error(error.message)
  }
}

const createSubscription = async (
  input: IWebhookSubscriptions
) => {
  const query = `
    mutation Subscribe($input: SubcribeWebhookInput!){
      subscribe(input: $input)
    }`

  const variables = {
    input
  }

  try {
    const res = await fetchWebhookService(query, variables)

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.subscribe
  } catch (error) {
    throw new Error(error.message)
  }
}

const updateSubscription = async (
  input: IWebhookSubscriptions
) => {
  const query = `
    mutation UpdateSubscription($input: UpdateSubscriptionInput!){
      updateSubscription(input: $input)
    }`

  const variables = {
    input
  }

  try {
    const res = await fetchWebhookService(query, variables)

    if (res.data?.errors) {
      throw new Error(res.data.errors[0].message)
    }

    return res.data.data.updateSubscription
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  getAvailableWebhooks,
  getAllSubscriptions,
  createSubscription,
  updateSubscription
}