let permissions = [
  { name: "commission" },
  { name: "orders" },
  { name: "generateLink" },
  { name: "payments" }
]

const SERVICE_ADMIN = "ADMIN";
const SERVICE_RESPONSIBLE = "RESPONSIBLE";
const SERVICE_SALE = "SALE";
const SERVICE_ANALYST = "ANALYST";

const GRANT_HIDE = 'hide';
const GRANT_READ = 'read';
const GRANT_WRITE = 'write';

const AFFILIATE_SERVICE = "affiliate";

exports.seed = async function(knex) { 
  
  return Promise.all([
    knex('service_roles').insert([{ name: SERVICE_ADMIN }, { name: SERVICE_RESPONSIBLE }, { name: SERVICE_ANALYST }, {name: SERVICE_SALE}]).returning('*'),
    knex('permissions').insert(permissions).returning('*'),
    knex('services').insert([{ name: AFFILIATE_SERVICE }, { name: "teste" }]).returning('*')
  ])
  .then((item) => 
  {
      
              const serviceAdminRole = item[0].filter(serviceRole => serviceRole.name === SERVICE_ADMIN);
              const serviceSaleRole = item[0].filter(serviceRole => serviceRole.name === SERVICE_SALE);
              const serviceAnalystRole = item[0].filter(serviceRole => serviceRole.name === SERVICE_ANALYST);

              const serviceAdminRoleId = serviceAdminRole[0].id;
              const serviceAnalystRoleId = serviceAnalystRole[0].id;
              const serviceSaleRoleId = serviceSaleRole[0].id;

              const serviceRolesPermissions = [];

              const affiliateService = item[2].filter(service => service.name === AFFILIATE_SERVICE);

              item[1].map(permission => {
                  switch (permission.name) {
                      case "commission":
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAdminRoleId, grant: GRANT_WRITE })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAnalystRoleId, grant: GRANT_READ })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceSaleRoleId, grant: GRANT_HIDE })
                          return
                      case "orders":
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAdminRoleId, grant: GRANT_READ })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAnalystRoleId, grant: GRANT_READ })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceSaleRoleId, grant: GRANT_READ })
                          return 
                      case "generateLink":
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAdminRoleId, grant: GRANT_HIDE })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAnalystRoleId, grant: GRANT_WRITE })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceSaleRoleId, grant: GRANT_HIDE })
                          return 
                    case "payments":
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAdminRoleId, grant: GRANT_WRITE })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceAnalystRoleId, grant: GRANT_WRITE })
                          serviceRolesPermissions.push({service_id: affiliateService[0].id ,permission_id: permission.id , service_role_id: serviceSaleRoleId, grant: GRANT_WRITE })
                          return 
                      default: return;
                  }
              })

              return knex('service_roles_permissions').insert(serviceRolesPermissions).returning('*')
          }
      )
};