import common from "../common"

export const getInvoicesPath = (payload: { userId: string, organizationId: string, month: string, year: string, mimeType: string }) => {
  const { userId, organizationId, month, year, mimeType } = payload
  const key = 'invoices'
  const path = `${userId}-${organizationId}-${month}/${year}`
  const encryptedPath = common.encryptSHA256(path)
  const [, extension] = mimeType.split('/')

  return `${key}/${encryptedPath}.${extension}`
}