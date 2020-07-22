import knexDatabase from "../../../knex-database";
import store from "../../../store";
import { _serviceAdapter, _usersOrganizationServiceAdapter, _serviceRolesAdapter } from "../adapters";

export const organizationServicesByOrganizationIdLoader = store.registerOneToManyLoader(
async (userOrganizationIds : string[]) => {
    const query = await knexDatabase.knex('users_organization_service_roles AS uosr')
    .innerJoin('organization_services AS os', 'os.id', 'uosr.organization_services_id')
    .innerJoin('services AS serv', 'serv.id', 'os.service_id')
    .whereIn('uosr.users_organization_id', userOrganizationIds)
    .select('serv.*', 'uosr.service_roles_id', 'uosr.users_organization_id');
    return query;
},
    'users_organization_id',
    _serviceAdapter
);
  
export const userOrganizationServicesByIdLoader = store.registerOneToOneLoader(
async (userOrganizationServiceIds : string[]) => {
    const query = await knexDatabase.knex('users_organization_service_roles')
    .whereIn('id', userOrganizationServiceIds)
    .select('*');
    return query;
},
    'id',
    _usersOrganizationServiceAdapter
);
  
export const userOrganizationServicesHasLinkGeneratedByIdLoader = store.registerOneToOneLoader(
    async (userOrganizationServiceIds : string[]) => {
        const query = await knexDatabase.knex('users_organization_service_roles_url_shortener')
        .whereIn('users_organization_service_roles_id', userOrganizationServiceIds)
        .limit(1)
        .select('*');
        return query;
    },
    'users_organization_service_roles_id',
    (record: any) => record
);
  
export const organizationServicesRolesByIdLoader = store.registerOneToManyLoader(
    async (serviceRolesId : string[]) => {
        const query = await knexDatabase.knex('service_roles')
        .whereIn('id', serviceRolesId)
        .select();
        return query;
    },
    'id',
    _serviceRolesAdapter
);
  
export const organizationServicesRolesByIdOneToOneLoader = store.registerOneToOneLoader(
    async (serviceRolesId : string[]) => {
        const query = await knexDatabase.knex('service_roles')
        .whereIn('id', serviceRolesId)
        .select();
        return query;
    },
    'id',
    _serviceRolesAdapter
);