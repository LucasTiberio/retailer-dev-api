import { IInviteUserToOrganizationData, IOrganizationFromDB, IOrganizationPayload, OrganizationRoles, OrganizationInviteStatus, IInviteUserToOrganizationPayload } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import database from "../../knex-database";
import MailService from '../mail/service';
import UserService from '../users/service';
import knexDatabase from "../../knex-database";
import common from "../../common";

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

     const organizationRole = await organizationRoleByName(roleName, trx);

     if(!organizationRole) throw new Error("Organization role not found.")
     
     await (trx || knexDatabase.knex)('users_organization_roles').insert({
      user_id: userId,
      organization_id: organizationId, 
      organization_role_id: organizationRole.id,
      invite_status: OrganizationInviteStatus.ACCEPT
     })

}

const organizationRoleByName = async (roleName: OrganizationRoles, trx: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', roleName).select('id');
  return organizationRole;
}

const inviteUserToOrganization = async (usersToAttach: IInviteUserToOrganizationPayload, token: IUserToken, trx: Transaction) => {

  if(!token) throw new Error("Token must be provided.");

  try {

    const organizationId = usersToAttach.organizationId;

    const [organization] = await (trx || knexDatabase.knex)('organizations').where('id', organizationId).select('name');

    if(!organization) throw new Error("Organization not found.")

    const [memberOrganizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', OrganizationRoles.MEMBER).select('id');

    const usersAttached = await Promise.all(usersToAttach.users.map(async (user : IInviteUserToOrganizationData ) => {

      let hashToVerify = await common.encrypt(JSON.stringify({...user, timestamp: +new Date()}));

      let userOrganizationCreated;

      if(user.id){

        userOrganizationCreated = await createUserOrganizationRoles(hashToVerify, user.id, organizationId, memberOrganizationRole.id, trx);

        await MailService.sendInviteUserMail({
          email: user.email,
          hashToVerify,
          organizationName: organization.name,
        })
      
      } else {

        const partialUserCreated = await UserService.signUpWithEmailOnly(user.email, trx);

        userOrganizationCreated = await createUserOrganizationRoles(hashToVerify, partialUserCreated.id, organizationId, memberOrganizationRole.id, trx);

        await MailService.sendInviteNewUserMail({
          email: partialUserCreated.email,
          hashToVerify,
          organizationName: organization.name
        })

      }

      return userOrganizationCreated;

    }))

    return usersAttached;


  } catch(e){
    throw new Error(e.message);
  }

}

const createUserOrganizationRoles = async (hashToVerify: string, userId: string, organizationId: string, organizationRoleId: string, trx : Transaction ) => {
  const [createdUserOrganizationRoles] = await (trx || knexDatabase.knex)('users_organization_roles').insert({
    invite_hash: hashToVerify,
    user_id: userId,
    organization_id: organizationId,
    organization_role_id: organizationRoleId,
    invite_status: OrganizationInviteStatus.PENDENT
  }).returning('*')
  return createdUserOrganizationRoles
}

export default {
  createOrganization,
  verifyOrganizationName,
  inviteUserToOrganization
}
