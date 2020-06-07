let permissions = [
    { name: "settings" },
    { name: "members" },
    { name: "integrations" },
    { name: "affiliate" }
]

const ORGANIZATION_ADMIN = "ADMIN";
const ORGANIZATION_MEMBER = "MEMBER";

const GRANT_HIDE = 'hide';
const GRANT_READ = 'read';
const GRANT_WRITE = 'write';

exports.seed = async function(knex) { 
    
    return Promise.all([
        knex('organization_roles').insert([{ name: ORGANIZATION_ADMIN }, { name: ORGANIZATION_MEMBER }]).returning('*'),
        knex('permissions').insert(permissions).returning('*')
    ])
    .then((item) => 
    {
        
                const organizationAdminRole = item[0].filter(organizationRole => organizationRole.name === ORGANIZATION_ADMIN);
                const organizationMemberRole = item[0].filter(organizationRole => organizationRole.name === ORGANIZATION_MEMBER);

                const organizationAdminRoleId = organizationAdminRole[0].id;
                const organizationMemberRoleId = organizationMemberRole[0].id;

                const organizationRolesPermissions = [];

                item[1].map(permission => {
                    switch (permission.name) {
                        case "settings":
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationAdminRoleId, grant: GRANT_WRITE })
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationMemberRoleId, grant: GRANT_HIDE })
                            return
                        case "members":
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationAdminRoleId, grant: GRANT_WRITE })
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationMemberRoleId, grant: GRANT_READ })
                            return 
                        case "integrations":
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationAdminRoleId, grant: GRANT_WRITE })
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationMemberRoleId, grant: GRANT_HIDE })
                            return 
                        case "affiliate":
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationAdminRoleId, grant: GRANT_WRITE })
                            organizationRolesPermissions.push({permission_id: permission.id , organization_role_id: organizationMemberRoleId, grant: GRANT_HIDE })
                            return 
                        default: return;
                    }
                })

                return knex('organization_roles_permissions').insert(organizationRolesPermissions).returning('*')
            }
        )
  };