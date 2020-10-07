import service from '../service'

jest.unmock('../service')

export default {
  createVtexHook: jest.fn(() => true),
  verifyVtexSecrets: service.verifyVtexSecrets,
}
