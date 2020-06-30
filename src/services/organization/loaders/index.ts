import { _organizationRoleAdapter, _organizationAdapter } from "../adapters";
import store from "../../../store";
import knexDatabase from "../../../knex-database";

export const organizationRoleByUserIdLoader = store.registerOneToManyLoader(
    async (userOrganizationIds : string[]) => {
      return await knexDatabase.knex('users_organization_roles AS uor')
      .innerJoin('organization_roles AS orgr', 'orgr.id', 'uor.organization_role_id')
      .whereIn('users_organization_id', userOrganizationIds)
      .select('orgr.*', "uor.users_organization_id")
    },
      'users_organization_id',
      _organizationRoleAdapter
  );
  
export const organizationByIdLoader = store.registerOneToOneLoader(
    async (organizationIds : string[]) => {
      return knexDatabase.knex('organizations').whereIn('id', organizationIds).select()
    },
      'id',
      _organizationAdapter
  );
  
export const organizationByUserIdLoader = store.registerOneToManyLoader(
    async (userIds : string[]) => {
      const query = await knexDatabase.knex('users_organizations AS uo')
      .innerJoin('organizations AS org', 'org.id', 'uo.organization_id')
      .whereIn('uo.user_id', userIds)
      .select('org.*', 'uo.id AS users_organizations_id', 'uo.user_id')
      return query;
    },
      'user_id',
      _organizationAdapter
  );
  
export const organizationHasMemberLoader = store.registerOneToManyLoader(
    async (organizationIds : string[]) => {
      const query = await knexDatabase.knex('users_organizations')
      .where('active', true)
      .whereIn('organization_id', organizationIds)
      .limit(2)
      .select('*')
      return query;
    },
      'organization_id',
      _organizationAdapter
  );
  
export const organizationHasAnyMemberLoader = store.registerOneToManyLoader(
    async (organizationIds : string[]) => {
      const query = await knexDatabase.knex('users_organizations')
      .whereIn('organization_id', organizationIds)
      .limit(2)
      .select('*')
      return query;
    },
      'organization_id',
      _organizationAdapter
  );