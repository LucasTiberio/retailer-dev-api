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
        apiKey
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

const getAllExecutions = async (input: { offset: number, limit: number }, ctx: { organizationId: string }) => {
  const query = `
    query GetAll($input: GetAllExecutionsInput!) {
      getAllExecutions(input: $input) {
        data {
          id
          webhook {
            apiKey
            organizationId
            description
            enabledTopics
            status
          }
          payload {
            event
          }
          executed
          nextExecutionAt
        }
        count
      }
    }
  `

  try {
    const res = await fetchWebhookService(query, {
      input: { ...input, ...ctx }
    })

    if (res?.data?.errors) {
      throw new Error(res?.data?.errors[0]?.message)
    }

    return res?.data?.data?.getAllExecutions ?? []
  } catch (error) {
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

const triggerManualSend = async (
  input: { executionId: string }
) => {
  const query = `
    mutation TriggerManualSend($input: TriggerManualSendInput!){
      triggerManualSend(input: $input) {
        success
        nextExecution
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

    return res.data.data.triggerManualSend
  } catch (error) {
    throw new Error(error.message)
  }
}

export default {
  getAvailableWebhooks,
  getAllSubscriptions,
  getAllExecutions,
  createSubscription,
  updateSubscription,
  triggerManualSend
}