import common from "../common"

export const getInvoicesPath = (payload: { userId: string, organizationId: string, month: string, year: string }) => {
  const { userId, organizationId, month, year } = payload
  const key = 'invoices'
  const path = `${userId}-${organizationId}-${month}/${year}`
  const encryptedPath = common.encryptSHA256(path)

  return `${key}/${encryptedPath}`
}