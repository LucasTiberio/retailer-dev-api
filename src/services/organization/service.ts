import { IUserOrganizationRolesFromDB, IInviteUserToOrganizationData, IOrganizationFromDB, IOrganizationPayload, OrganizationRoles, OrganizationInviteStatus, IInviteUserToOrganizationPayload, IResponseInvitePayload, IFindUsersAttributes, IUserOrganizationAdaptedFromDB } from "./types";
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

const _usersOrganizationsAdapter = (record: IUserOrganizationAdaptedFromDB) => ({
    id: record.id,
    userId: record.user_id,
    organizationId: record.organization_id,
    inviteStatus: record.invite_status,
    inviteHash: record.invite_hash,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    active: record.active,
    organizationRoleId: record.organization_role_id
})

const _usersOrganizationsRolesAdapter = (record: IUserOrganizationRolesFromDB) => ({
  id: record.id,
  userOrganizationId: record.users_organization_id,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  organizationRoleId: record.organization_role_id
})

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

      const [userInvitedOnPast] = await (trx || knexDatabase.knex)('users_organizations AS uo')
        .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
        .where('usr.email', user.email)
        .select('uo.*');

      if(userInvitedOnPast){

        const [userReinvited] = await (trx || knexDatabase.knex)('users_organizations AS uo')
          .update({ active: true, invite_status: OrganizationInviteStatus.PENDENT, invite_hash: hashToVerify })
          .where('id', userInvitedOnPast.id)
          .returning('id');

        return userReinvited;
      }

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

const userOrganizationInviteStatus = async (userId: string, organizationId: string,  trx: Transaction) => {

  const [userOrganizationInviteStatusFound] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', userId).andWhere('organization_id', organizationId).select();

  return _usersOrganizationsAdapter(userOrganizationInviteStatusFound);

}

const getUserOrganizationById = async (userOrganizationId: string, trx?: Transaction) => {

  const [userOrganization] = await (trx || knexDatabase.knexTest)('users_organizations').where('id', userOrganizationId).select();

  return _usersOrganizationsAdapter(userOrganization)

}

const getOrganizationById = async (organizationId: string, trx?: Transaction) => {

  const [organization] = await (trx || knexDatabase.knexTest)('organizations').where('id', organizationId).select();

  return _organizationAdapter(organization)

}

const getOrganizationRoleId = async (organizationRoleName: OrganizationRoles, trx: Transaction) => {

  const [organizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', organizationRoleName).select();

  return organizationRole;

}

const getOrganizationRoleById = async (organizationRoleId: string, trx?: Transaction) => {

  const [organizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('id', organizationRoleId).select();

  return organizationRole;

}

const inativeUserInOrganization = async (inativeUserInOrganizationPayload: {userId: string, organizationId: string}, userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided.");

  const { userId, organizationId } = inativeUserInOrganizationPayload;

  const [userOrganizationFound] = await (trx || knexDatabase.knex)('users_organizations')
  .where('user_id', userId)
  .andWhere('organization_id', organizationId);

  if(!userOrganizationFound) throw new Error("user not found in organization!");

  const [userFound] = await (trx || knexDatabase.knex)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')  
    .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')  
    .where('uo.id', userOrganizationFound.id)
    .select('uo.id', 'or.name');

  if(userFound.name === OrganizationRoles.ADMIN){
    const [organizationFound] = await (trx || knexDatabase.knex)('organizations').where('id', organizationId).select('user_id');
    if(organizationFound.user_id !== userToken.id){
      throw new Error('Not possible inative other admins');
    }
  }

  const [userOrganizationInatived] = await (trx || knexDatabase.knex)('users_organizations')
    .update({active: false})
    .where('id', userOrganizationFound.id)
    .returning('*');

  const memberOrganizationRole = await getOrganizationRoleId(OrganizationRoles.MEMBER, trx);

  await (trx || knexDatabase.knex)('users_organization_roles')
    .where('users_organization_id', userOrganizationInatived.id)
    .update({ organization_role_id: memberOrganizationRole.id })

  return _usersOrganizationsAdapter(userOrganizationInatived);

}

const listUsersInOrganization = async (listUsersInOrganizationPayload : { name? : string, organizationId: string }, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided.");

  const { organizationId, name } = listUsersInOrganizationPayload;

  let query = (trx || knexDatabase)('users_organizations AS uo')
    .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .where('uo.organization_id', organizationId)
    .whereNot('uo.user_id', userToken.id)

  if(name) {
    query = query.whereRaw(`LOWER(email) LIKE ?`, [`%${name.toLowerCase()}%`])
      .orWhereRaw(`LOWER(username) LIKE ?`, [`%${name.toLowerCase()}%`])
  }

  const result = await query.select('uo.*', 'uor.organization_role_id');

  return result.map(_usersOrganizationsAdapter);

}

const getUserOrganizationByIds = async (userId: string, organizationId: string, trx: Transaction) => {

  const [userOrganization] = await (trx || knexDatabase.knex)('users_organizations')
    .where('user_id', userId)
    .andWhere('organization_id', organizationId)
    .select();

  return userOrganization;

}

const getUserOrganizationRoleById = async (userOrganizationId: string, trx: Transaction) => {

  const [userOrganizationRole] = await (trx || knexDatabase.knex)('users_organization_roles')
    .where('users_organization_id', userOrganizationId)
    .select();

  return _usersOrganizationsRolesAdapter(userOrganizationRole);
}

const isFounder = async (organizationId: string, userId: string, trx: Transaction) => {

  const [organizationFound] = await (trx || knexDatabase.knex)('organizations')
    .where('id', organizationId)
    .select('user_id');

  return organizationFound.user_id === userId;

}

const handleUserPermissionInOrganization = async (handleUserPermissionInOrganizationPayload: { permission: OrganizationRoles, organizationId: string, userId: string }, userToken: IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided.");

  const { permission, organizationId, userId } = handleUserPermissionInOrganizationPayload;

  if(permission === OrganizationRoles.MEMBER && !(await isFounder(organizationId, userToken.id, trx))){
    throw new Error("Only founder can remove admin permission from organization.")
  }

  try {

    const userOrganization = await getUserOrganizationByIds(userId, organizationId, trx);

    const newPermission = await getOrganizationRoleId(permission, trx);
  
    if(!userOrganization) throw new Error("User not found in organization!");
  
    const [userPermissionUpdated] = await (trx || knexDatabase.knex)('users_organization_roles')
      .update({ organization_role_id: newPermission.id })
      .where('users_organization_id', userOrganization.id)
      .returning('*');

    return _usersOrganizationsRolesAdapter(userPermissionUpdated)

  } catch(e){
    throw new Error(e.message)
  }

};

const listMyOrganizations = async (userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided.");

  try {

    const organizations = await (trx || knexDatabase.knex)('users_organizations AS uo')
      .innerJoin('organizations AS orgn', 'orgn.id', 'uo.organization_id')
      .where('uo.user_id', userToken.id)
      .select('orgn.*');

    return organizations.map(_organizationAdapter);
  } catch(e){
    throw new Error(e.message)
  }


}

const organizationDetails = async (organizationDetailsPayload : { organizationId: string}, userToken : IUserToken, trx: Transaction) => {

  if(!userToken) throw new Error("token must be provided.");

  const organization = await getOrganizationById(organizationDetailsPayload.organizationId, trx);

  return organization;

}

export default {
  listUsersInOrganization,
  organizationDetails,
  listMyOrganizations,
  handleUserPermissionInOrganization,
  createOrganization,
  getUserOrganizationRoleById,
  verifyOrganizationName,
  inviteUserToOrganization,
  responseInvite,
  getOrganizationRoleById,
  isFounder,
  getUserOrganizationByIds,
  getOrganizationRoleId,
  _organizationAdapter,
  getOrganizationById,
  findUsersToOrganization,
  userOrganizationInviteStatus,
  getUserOrganizationById,
  inativeUserInOrganization
}
