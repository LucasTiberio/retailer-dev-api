import { IUserOrganizationRolesFromDB, IInviteUserToOrganizationData, IOrganizationFromDB, IOrganizationPayload, OrganizationRoles, OrganizationInviteStatus, IInviteUserToOrganizationPayload, IResponseInvitePayload, IFindUsersAttributes, IUserOrganizationAdaptedFromDB } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import database from "../../knex-database";
import MailService from '../mail/service';
import VtexService from '../vtex/service';
import UserService from '../users/service';
import ServicesService from '../services/service';
import StorageService from '../storage/service';
import knexDatabase from "../../knex-database";
import common from "../../common";
import { IUserOrganizationDB, IOrganizationRoleFromDb } from "./types";
import store from "../../store";
import sharp from 'sharp';
import { IPagination } from "../../common/types";
import { Services } from "../services/types";
import { RedisClient } from "redis";
import { MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION, MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED } from '../../common/consts';

const _organizationAdapter = (record: IOrganizationFromDB) => ({
  id: record.id,
  name: record.name,
  contactEmail: record.contact_email,
  userId: record.user_id,
  active: record.active,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
  userOrganizationId: record.users_organizations_id,
  logo: record.logo ? `${record.logo}?${+new Date()} ` : null
});

const _organizationRoleAdapter = (record: IOrganizationRoleFromDb) => ({
  id: record.id,
  name: record.name,
  updatedAt: record.updated_at,
  createdAt: record.created_at
})

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

const organizationRoleByUserIdLoader = store.registerOneToManyLoader(
  async (userOrganizationIds : string[]) => {
    return await knexDatabase.knex('users_organization_roles AS uor')
    .innerJoin('organization_roles AS orgr', 'orgr.id', 'uor.organization_role_id')
    .whereIn('users_organization_id', userOrganizationIds)
    .select('orgr.*', "uor.users_organization_id")
  },
    'users_organization_id',
    _organizationRoleAdapter
);

const organizationByIdLoader = store.registerOneToOneLoader(
  async (organizationIds : string[]) => {
    return knexDatabase.knex('organizations').whereIn('id', organizationIds).select()
  },
    'id',
    _organizationAdapter
);

const organizationByUserIdLoader = store.registerOneToManyLoader(
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

const organizationHasMemberLoader = store.registerOneToManyLoader(
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

const organizationHasAnyMemberLoader = store.registerOneToManyLoader(
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

const createOrganization = async (
    createOrganizationPayload : IOrganizationPayload, 
    context: { redisClient: RedisClient, client: IUserToken },
    trx : Transaction
  ) => {

  if(!context.client) throw new Error("invalid token");

  try {

    const [organizationCreated] = await (trx || database.knex)
    .insert({
      name: createOrganizationPayload.name,
      contact_email: createOrganizationPayload.contactEmail,
      user_id: context.client.id
    }).into('organizations').returning('*')

    await organizationRolesAttach(context.client.id, organizationCreated.id, OrganizationRoles.ADMIN, OrganizationInviteStatus.ACCEPT, trx);

    const affiliateServiceFound = await ServicesService.getServiceByName(Services.AFFILIATE, trx);

    if(!affiliateServiceFound) throw new Error("Affiliate service doesnt exists.");

    await ServicesService.createServiceInOrganization(affiliateServiceFound.id, organizationCreated.id, context.client, trx);

    await setCurrentOrganization({organizationId: organizationCreated.id}, { client: context.client, redisClient: context.redisClient}, trx);

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

const inviteUserToOrganization = async (
    usersToAttach: IInviteUserToOrganizationPayload, 
    context: { organizationId: string, client: IUserToken },
    trx: Transaction
  ) => {

  if(!context.client) throw new Error("Token must be provided.");

  try {

    const organizationId = context.organizationId;

    const [organization] = await (trx || knexDatabase.knex)('organizations').where('id', organizationId).select('name');

    if(!organization) throw new Error("Organization not found.");

    await Promise.all(usersToAttach.users.map(async (user : IInviteUserToOrganizationData ) => {

      let hashToVerify = await common.encryptSHA256(JSON.stringify({...user, timestamp: +new Date()}));

      let userOrganizationCreated;

      const [userInvitedOnPast] = await (trx || knexDatabase.knex)('users_organizations AS uo')
        .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
        .where('usr.email', user.email)
        .where('uo.organization_id', organizationId)
        .select('uo.*', 'usr.email', 'usr.username');

      if(userInvitedOnPast){

        const [userReinvited] = await (trx || knexDatabase.knex)('users_organizations AS uo')
          .update({ active: true, invite_status: OrganizationInviteStatus.PENDENT, invite_hash: hashToVerify })
          .where('id', userInvitedOnPast.id)
          .returning('id');

        await MailService.sendInviteUserMail({
          email: user.email,
          hashToVerify,
          organizationName: organization.name,
        })

        return userReinvited;
      }

      if(user.id){

        userOrganizationCreated = await organizationRolesAttach(
          user.id, organizationId, 
          user.role || OrganizationRoles.MEMBER,
          OrganizationInviteStatus.PENDENT, 
          trx, 
          hashToVerify);

        await MailService.sendInviteUserMail({
          email: user.email,
          hashToVerify,
          organizationName: organization.name,
        })
      
      } else {

        const userEmailFound = await UserService.getUserByEmail(user.email, trx);

        if(userEmailFound){

          const usersOrganizationFound = await getUserOrganizationByIds(userEmailFound.id, organizationId, trx);

          if(usersOrganizationFound){

            const [userOrganizationCreatedId] = await (trx || knexDatabase.knex)('users_organizations').update({
              invite_status: OrganizationInviteStatus.PENDENT,
              active: true
             }).where('id', usersOrganizationFound.id).returning('id');

             await MailService.sendInviteUserMail({
              email: user.email,
              hashToVerify,
              organizationName: organization.name,
            })
  
            return userOrganizationCreatedId;

          } else {

            const userAttached = await organizationRolesAttach(
              userEmailFound.id, 
              organizationId, 
              user.role || OrganizationRoles.MEMBER,
              OrganizationInviteStatus.PENDENT, 
              trx, 
              hashToVerify);

            await MailService.sendInviteUserMail({
              email: user.email,
              hashToVerify,
              organizationName: organization.name,
            })

            return userAttached;

          }

        }

        const partialUserCreated = await UserService.signUpWithEmailOnly(user.email, trx);

        userOrganizationCreated = await await organizationRolesAttach(
          partialUserCreated.id, 
          organizationId, 
          user.role || OrganizationRoles.MEMBER,
          OrganizationInviteStatus.PENDENT, 
          trx, 
          hashToVerify);

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

  try {
    await (trx || knexDatabase.knex)('users_organizations')
    .update({
      invite_hash: null,
      invite_status: responseInvitePayload.response
    })
    .where('invite_hash', responseInvitePayload.inviteHash);

    if(!user) return {status: true}

    if(!user.encrypted_password || !user.username){
      return {
        status: false,
        email: user.email
      }
    }

    return {status: true};
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
})

const findUsersToOrganization = async (
    findUserAttributes: IFindUsersAttributes, 
    context: { client: IUserToken, organizationId: string },
    trx: Transaction
  ) => {

  if(!context.client) throw new Error("token must be provided.");

  const searchTerm = findUserAttributes.name.toLowerCase();

  const userFoundWithResponses = await (trx || knexDatabase.knex).raw(
    `
    SELECT usr.id, usr.username, usr.email, uo.invite_status
    FROM users AS usr
      LEFT JOIN users_organizations AS uo
        ON usr.id = uo.user_id
        AND uo.organization_id = '${context.organizationId}'
      WHERE usr.id <> '${context.client.id}' 
      AND (LOWER(usr.username) LIKE ? OR LOWER(usr.email) LIKE ?) `, [`%${searchTerm}%`,`%${searchTerm}%`]
  );

  return userFoundWithResponses.rows.map(_usersOrganizationAdapter);

}

const userOrganizationInviteStatus = async (userId: string, organizationId: string,  trx: Transaction) => {

  const [userOrganizationInviteStatusFound] = await (trx || knexDatabase.knex)('users_organizations').where('user_id', userId).andWhere('organization_id', organizationId).select();

  return _usersOrganizationsAdapter(userOrganizationInviteStatusFound);

}

const getUserOrganizationById = async (userOrganizationId: string, trx?: Transaction) => {

  const [userOrganization] = await (trx || knexDatabase.knex)('users_organizations').where('id', userOrganizationId).select();

  return userOrganization ? _usersOrganizationsAdapter(userOrganization) : null;

}

const getOrganizationById = async (organizationId: string, trx?: Transaction) => {

  if(trx){
    const [organization] = await (trx || knexDatabase.knex)('organizations').where('id', organizationId).select(); 

    return _organizationAdapter(organization);
  }

  const organizations = await organizationByIdLoader().load(organizationId)

  return organizations;

}

const getOrganizationByUserId = async (userId: string, organizationId?: string) => {

  if(organizationId){

    const organization = await knexDatabase.knex('users_organizations AS uo')
    .innerJoin('organizations AS org', 'org.id', 'uo.organization_id')
    .where('uo.user_id', userId)
    .andWhere("uo.organization_id", organizationId)
    .select('org.*', 'uo.id AS users_organizations_id', 'uo.user_id')

    return organization.map(_organizationAdapter);

  }

  const organizations = await organizationByUserIdLoader().load(userId)

  return organizations;

}

const getOrganizationByName = async (organizationName: string, trx?: Transaction) => {

  const [organization] = await (trx || knexDatabase.knexTest)('organizations').where('name', organizationName).select();

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

const inativeUsersInOrganization = async (
  inativeUsersInOrganizationPayload: {usersId: string[]}, 
  context: { organizationId: string, client: IUserToken },
  trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided.");

  return await Promise.all(inativeUsersInOrganizationPayload.usersId.map(async userId => {

    const [userOrganizationFound] = await (trx || knexDatabase.knex)('users_organizations')
    .where('user_id', userId)
    .andWhere('organization_id', context.organizationId);

    if(!userOrganizationFound) return {
      userError: {
        message: "user not found in organization!",
        userId
      }
    };

    const [userFound] = await (trx || knexDatabase.knex)('users_organizations AS uo')
      .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')  
      .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')  
      .where('uo.id', userOrganizationFound.id)
      .select('uo.id', 'or.name');

    if(userFound.name === OrganizationRoles.ADMIN){
      const [organizationFound] = await (trx || knexDatabase.knex)('organizations').where('id', context.organizationId).select('user_id');
      if(organizationFound.user_id !== context.client.id){
        return {
          userError: {
            message: 'Not possible inative other admins',
            userId
          }
        }
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

    return {
      userOrganization: _usersOrganizationsAdapter(userOrganizationInatived)
    }

  }))

}

const listUsersInOrganization = async (
  listUsersInOrganizationPayload : { showActive?: boolean, name? : string } & IPagination, 
  context: { client: IUserToken, organizationId: string }, 
  trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided.");

  const { name, offset, limit, showActive } = listUsersInOrganizationPayload;

  let query = (trx || knexDatabase.knex)('users_organizations AS uo')
  .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
  .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
  .where('uo.organization_id', context.organizationId)
  .whereNot('uo.user_id', context.client.id)

  if(showActive){
    query.where('uo.active', true);
  }

  if(name) {
    query = query.andWhereRaw(`(LOWER(email) LIKE ? OR LOWER(username) LIKE ?)`, [`%${name.toLowerCase()}%`, `%${name.toLowerCase()}%`])
  }

  var [totalCount] = await query.clone().count();

  if(limit) {
    query = query.limit(limit)
  }

  if(offset) {
    query = query.offset(offset)
  }

  const result = await query.select('uo.*', 'uor.organization_role_id')
    .orderBy('usr.username', 'asc')

  return {
    count: totalCount.count,
    usersOrganizations: result.map(_usersOrganizationsAdapter)
  };

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

const isOrganizationAdmin = async (userOrganizationId: string, trx: Transaction) => {

  const [userOrganizationRole] = await (trx || knexDatabase.knex)('users_organization_roles AS uor')
    .innerJoin('organization_roles AS or', 'uor.organization_role_id', 'or.id')
    .where('uor.users_organization_id', userOrganizationId)
    .select('or.name');

  return userOrganizationRole.name === OrganizationRoles.ADMIN;
}

const isFounder = async (organizationId: string, userId: string, trx: Transaction) => {

  const [organizationFound] = await (trx || knexDatabase.knex)('organizations')
    .where('id', organizationId)
    .select('user_id');

  return organizationFound.user_id === userId;

}

const handleUserPermissionInOrganization = async (
  handleUserPermissionInOrganizationPayload: { permission: OrganizationRoles, userId: string }, 
  context: { organizationId: string, client: IUserToken }, 
  trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided.");

  const { permission, userId } = handleUserPermissionInOrganizationPayload;

  if(permission === OrganizationRoles.MEMBER && !(await isFounder(context.organizationId, context.client.id, trx))){
    throw new Error("Only founder can remove admin permission from organization.")
  }

  try {

    const userOrganization = await getUserOrganizationByIds(userId, context.organizationId, trx);

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
      .andWhere('uo.active', true)
      .select('orgn.*');

    return organizations.map(_organizationAdapter);
  } catch(e){
    throw new Error(e.message)
  }


}

const organizationDetails = async (
  context: { organizationId: string, client: IUserToken },
  trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided.");

  const organization = await getOrganizationById(context.organizationId, trx);

  return organization;

}

const getUserOrganizationRole = async (userOrganizationId: string) => {

  const userOrganizationRole = await organizationRoleByUserIdLoader().load(userOrganizationId);

  return userOrganizationRole;

}

const verifyOrganizationHasMember = async (organizationId: string) => {

  const userOrganizationRole = await organizationHasMemberLoader().load(organizationId);

  return userOrganizationRole.length > 1;

}

const organizationUploadImage = async (organizationUploadImagePayload: {
  imageName: string
  mimetype: string
  data: any
},
context: { organizationId: string, client: IUserToken },
trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided.");

  const { mimetype, data } = organizationUploadImagePayload;

  if(!mimetype.match(/\/png/ig)?.length && !mimetype.match(/\/jpg/ig)?.length && !mimetype.match(/\/jpeg/ig)?.length){
    throw new Error("only image/png and image/jpg is supported!")
  }

  const path = common.encryptSHA256(context.organizationId);

  const pipeline = sharp().resize(248, 160, {
    fit: "contain"
  });

  let newData

  if(process.env.NODE_ENV !== 'test')
    newData = await data.pipe(pipeline);

  const imageUploaded = await StorageService.uploadImage(
    process.env.NODE_ENV === 'test' ? `tdd/${path}` : path,
    process.env.NODE_ENV === 'test' ? data : newData, 
    mimetype,
    trx
  );

  const [organizationAttachLogo] = await (trx || knexDatabase.knex)('organizations')
  .where('id', context.organizationId)
  .update({
    logo: imageUploaded.url
  }).returning('*');  

  return _organizationAdapter(organizationAttachLogo);

}
const setCurrentOrganization = async (currentOrganizationPayload : { organizationId: string | null }, context: { client: IUserToken, redisClient: RedisClient }, trx: Transaction) => {

  if(!context.client) throw new Error(MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED);

  if(!currentOrganizationPayload.organizationId){
    return context.redisClient.del(context.client.id)
  }

  const isUserOrganization = await getUserOrganizationByIds(context.client.id, currentOrganizationPayload.organizationId, trx);

  if(!isUserOrganization) throw new Error(MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION);

  try {
    const currentOrganization = await context.redisClient.setAsync(context.client.id, currentOrganizationPayload.organizationId);
    return currentOrganization === "OK";
  } catch(e){
    throw new Error(e.message)
  }



}

const verifyShowFirstSteps = async (organizationId: string) => {

  const members = await organizationHasAnyMemberLoader().load(organizationId);

  const vtexIntegration = await VtexService.verifyIntegration(organizationId)

  const hasMember = members.length > 1;

  return !(!!vtexIntegration && hasMember)

}

export default {
  listUsersInOrganization,
  getOrganizationByName,
  verifyShowFirstSteps,
  organizationDetails,
  organizationUploadImage,
  getUserOrganizationRole,
  setCurrentOrganization,
  verifyOrganizationHasMember,
  listMyOrganizations,
  getOrganizationByUserId,
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
  inativeUsersInOrganization,
  isOrganizationAdmin
}
