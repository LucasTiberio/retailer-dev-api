import { IInviteUserToOrganizationData, IOrganizationFromDB, IOrganizationPayload, OrganizationRoles, OrganizationInviteStatus, IInviteUserToOrganizationPayload, IResponseInvitePayload, IFindUsersAttributes } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import database from "../../knex-database";
import MailService from '../mail/service';
import UserService from '../users/service';
import knexDatabase from "../../knex-database";
import common from "../../common";
import { IUserOrganizationDB } from "./types";

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

    await organizationRolesAttach(userToken.id, organizationCreated.id, OrganizationRoles.ADMIN, OrganizationInviteStatus.ACCEPT, trx);

    return _organizationAdapter(organizationCreated)
  } catch(e){
    throw new Error(e.message);
  }

}

const verifyOrganizationName = async (name : string, trx : Transaction) => {

  const organizationFound = await (trx || knexDatabase.knex)('organizations').where("name", name).select();

  return !!organizationFound.length

}

const organizationRolesAttach = async (userId: string, organizationId: string, roleName: OrganizationRoles, inviteStatus : OrganizationInviteStatus, trx: Transaction, hashToVerify?: string) => {

     const organizationRole = await organizationRoleByName(roleName, trx);

     if(!organizationRole) throw new Error("Organization role not found.");

     const [userOrganizationCreatedId] = await (trx || knexDatabase.knex)('users_organizations').insert({
      user_id: userId,
      organization_id: organizationId,
      invite_status: inviteStatus,
      invite_hash: hashToVerify
     }).returning('id');

     await (trx || knexDatabase.knex)('users_organization_roles').insert({
      user_id: userId,
      users_organization_id: userOrganizationCreatedId, 
      organization_role_id: organizationRole.id
     });

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

    await Promise.all(usersToAttach.users.map(async (user : IInviteUserToOrganizationData ) => {

      let hashToVerify = await common.encrypt(JSON.stringify({...user, timestamp: +new Date()}));

      let userOrganizationCreated;

      if(user.id){

        userOrganizationCreated = await organizationRolesAttach(user.id, organizationId, OrganizationRoles.MEMBER,OrganizationInviteStatus.PENDENT, trx, hashToVerify);

        await MailService.sendInviteUserMail({
          email: user.email,
          hashToVerify,
          organizationName: organization.name,
        })
      
      } else {

        const partialUserCreated = await UserService.signUpWithEmailOnly(user.email, trx);

        userOrganizationCreated = await await organizationRolesAttach(partialUserCreated.id, organizationId, OrganizationRoles.MEMBER,OrganizationInviteStatus.PENDENT, trx, hashToVerify);;

        await MailService.sendInviteNewUserMail({
          email: partialUserCreated.email,
          hashToVerify,
          organizationName: organization.name
        })

      }

      return userOrganizationCreated;

    }))

    return true;


  } catch(e){
    throw new Error(e.message);
  }

}

const responseInvite = async (responseInvitePayload : IResponseInvitePayload, trx : Transaction) => {

  const [user] = await (trx || knexDatabase.knex)('users_organizations as uo')
  .where('invite_hash', responseInvitePayload.inviteHash)
  .innerJoin('users as usr', 'usr.id', 'uo.user_id')
  .select('usr.encrypted_password', 'usr.username', 'usr.email');

  if(!user.encrypted_password || !user.username){
    return false
  }

  try {
    await (trx || knexDatabase.knex)('users_organizations')
    .update({
      invite_hash: null,
      invite_status: responseInvitePayload.response
    })
    .where('invite_hash', responseInvitePayload.inviteHash);

    return true;
  } catch (e) {
    throw new Error(e.message);
  }

}

const _usersOrganizationAdapter = (record: IUserOrganizationDB) => ({
  user: {
    id: record.id,
    username: record.username,
    email: record.email
  },
  inviteStatus: record.invite_status,
  usersOrganizationsId: record.users_organizations_id
})

const findUsersToOrganization = async (findUserAttributes: IFindUsersAttributes, userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided.");

  const searchTerm = findUserAttributes.name.toLowerCase();

  const userFoundWithResponses = await (trx || knexDatabase.knex).raw(
    `
    SELECT usr.id, usr.username, usr.email, uo.invite_status, uo.id as users_organizations_id
    FROM users AS usr
      LEFT JOIN users_organizations AS uo
      ON usr.id = uo.user_id
      WHERE usr.id <> '${userToken.id}' AND (LOWER(usr.username) LIKE ? OR LOWER(usr.email) LIKE ?) `, [`%${searchTerm}%`,`%${searchTerm}%`]
  );

  return userFoundWithResponses.rows.map(_usersOrganizationAdapter);

}

export default {
  createOrganization,
  verifyOrganizationName,
  inviteUserToOrganization,
  responseInvite,
  _organizationAdapter,
  findUsersToOrganization
}
