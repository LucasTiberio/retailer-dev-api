let permissions = [{ name: 'abandoned-carts' }]

const SERVICE_ADMIN = 'ADMIN'
const SERVICE_SALE = 'SALE'
const SERVICE_ANALYST = 'ANALYST'

const GRANT_HIDE = 'hide'
const GRANT_READ = 'read'
const GRANT_WRITE = 'write'

const AFFILIATE_SERVICE = 'affiliate'

exports.seed = async function (knex) {
  trx = await knex.transaction()

  try {
    return Promise.all([knex('service_roles').select(), knex('permissions').insert(permissions).returning('*'), knex('services').select()]).then((item) => {
      const serviceAdminRole = item[0].filter((serviceRole) => serviceRole.name === SERVICE_ADMIN)
      const serviceSaleRole = item[0].filter((serviceRole) => serviceRole.name === SERVICE_SALE)
      const serviceAnalystRole = item[0].filter((serviceRole) => serviceRole.name === SERVICE_ANALYST)

      const serviceAdminRoleId = serviceAdminRole[0].id
      const serviceAnalystRoleId = serviceAnalystRole[0].id
      const serviceSaleRoleId = serviceSaleRole[0].id

      const serviceRolesPermissions = []

      const affiliateService = item[2].filter((service) => service.name === AFFILIATE_SERVICE)

      item[1].map((permission) => {
        switch (permission.name) {
          case 'abandoned-carts':
            serviceRolesPermissions.push({ service_id: affiliateService[0].id, permission_id: permission.id, service_role_id: serviceAdminRoleId, grant: GRANT_WRITE })
            serviceRolesPermissions.push({ service_id: affiliateService[0].id, permission_id: permission.id, service_role_id: serviceAnalystRoleId, grant: GRANT_WRITE })
            serviceRolesPermissions.push({ service_id: affiliateService[0].id, permission_id: permission.id, service_role_id: serviceSaleRoleId, grant: GRANT_WRITE })
            return
          default:
            return
        }
      })

      return knex('service_roles_permissions').insert(serviceRolesPermissions).returning('*')
    })
  } catch (error) {
    console.log(error)
  }
}
