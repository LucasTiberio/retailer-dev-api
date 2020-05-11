import { IOrganizationFromDB, IOrganizationPayload } from "./types";
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
  
    return _organizationAdapter(organizationCreated)
  } catch(e){
    throw new Error(e.message);
  }

}

const verifyOrganizationName = async (name : string, trx : Transaction) => {

  const organizationFound = await (trx || knexDatabase.knex)('organizations').where("name", name).select();

  return !!organizationFound.length

}

export default {
  createOrganization,
  verifyOrganizationName
}
