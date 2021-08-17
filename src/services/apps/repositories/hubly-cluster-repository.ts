import HublyClusterData from "../models/HublyClusterData"

const getClusterByUserId = async (input: { affiliateId: string,  }, ctx: { organizationId: string }) => {
  return HublyClusterData.findOne({ ...input, ...ctx }).lean();
}

const saveUserInCluster = async (input: { affiliateId: string, cluster: string }, ctx: { organizationId: string }) => {
  const { affiliateId, cluster } = input

  const user = await HublyClusterData.create({
    affiliateId,
    name: cluster,
    ...ctx
  })

  if (user) return true

  return false
}

const updateUserCluster = async (input: { affiliateId: string, cluster: string }, ctx: { organizationId: string }) => {
  const payload = await HublyClusterData.findOneAndUpdate({
    affiliateId: input.affiliateId,
    ...ctx
  }, { name: input.cluster })

  console.log({payload})

  if (payload) return true

  return false
}

export default {
  getClusterByUserId,
  updateUserCluster,
  saveUserInCluster
}