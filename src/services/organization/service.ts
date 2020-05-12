import { IOrganizationFromDB, IOrganizationPayload, OrganizationRoles } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import database from "../../knex-database";
import knexDatabase from "../../knex-database";

const _organizationAdapter = (record: IOrganizationFromDB) => ({
  id: record.id,
  name: record.name,
  contactEmail: record.contact_email,
  userId: record.user_id,
  active: record.active,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const createOrganization = async (createOrganizationPayload : IOrganizationPayload, userToken : IUserToken, trx : Transaction) => {

  if(!userToken) throw new Error("invalid token");

  try {

    const [organizationCreated] = await (trx || database.knex)
    .insert({
      name: createOrganizationPayload.name,
      contact_email: createOrganizationPayload.contactEmail,
      user_id: userToken.id
    }).into('organizations').returning('*')

    await organizationRolesAttach(userToken.id, organizationCreated.id, OrganizationRoles.ADMIN, trx);
  
    return _organizationAdapter(organizationCreated)
  } catch(e){
    throw new Error(e.message);
  }

}

const verifyOrganizationName = async (name : string, trx : Transaction) => {

  const organizationFound = await (trx || knexDatabase.knex)('organizations').where("name", name).select();

  return !!organizationFound.length

}

const organizationRolesAttach = async (userId: string, organizationId: string, roleName: OrganizationRoles, trx: Transaction) => {

     const [organizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', roleName).select('id');

     if(!organizationRole) throw new Error("Organization role not found.")
     
     await (trx || knexDatabase.knex)('users_organization_roles').insert({
      user_id: userId,
      organization_id: organizationId, 
      organization_role_id: organizationRole.id
     })

}

export default {
  createOrganization,
  verifyOrganizationName
}
