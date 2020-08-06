import Faker from 'faker'

const UserMock = () => ({
  id: Faker.random.uuid(),
  username: Faker.name.firstName(),
  email: Faker.internet.email(),
  encrypted_password: Faker.internet.password(),
  verified: true,
  verification_hash: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export default UserMock
