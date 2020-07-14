import { IOrganizationPayload, OrganizationRoles, OrganizationInviteStatus, IResponseInvitePayload, IFindUsersAttributes } from "./types";
import { IUserToken } from "../authentication/types";
import { Transaction } from "knex";
import database from "../../knex-database";
import MailService from '../mail/service';
import OrganizationRulesService from '../organization-rules/service';
import VtexService from '../vtex/service';
import UserService from '../users/service';
import ServicesService from '../services/service';
import StorageService from '../storage/service';
import knexDatabase from "../../knex-database";
import common from "../../common";
import { IUserOrganizationDB, IOrganizationAdittionalInfos } from "./types";
import sharp from 'sharp';
import { IPagination } from "../../common/types";
import { Services, ServiceRoles } from "../services/types";
import { RedisClient } from "redis";
import { MESSAGE_ERROR_USER_NOT_IN_ORGANIZATION, MESSAGE_ERROR_TOKEN_MUST_BE_PROVIDED, FREE_TRIAL_DAYS, MESSAGE_ERROR_UPGRADE_PLAN, MESSAGE_ERROR_USER_NOT_TEAMMATE, MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST, MESSAGE_ERROR_USER_TEAMMATE, MESSAGE_ERROR_USER_PENDENT_ORGANIZATION_INVITE, MESSAGE_ERROR_USER_ALREADY_REPLIED_INVITE } from '../../common/consts';
import { stringToSlug } from './helpers';
import { _organizationRoleAdapter, _organizationAdapter, _usersOrganizationsAdapter, _usersOrganizationsRolesAdapter } from "./adapters";
import { organizationByIdLoader, organizationByUserIdLoader, organizationRoleByUserIdLoader, organizationHasMemberLoader, organizationHasAnyMemberLoader } from "./loaders";
import moment from "moment";

const attachOrganizationAditionalInfos = async (input: IOrganizationAdittionalInfos, trx: Transaction) => {

  const { segment, resellersEstimate, reason, plataform } = input;

  const [attachedOrganizationInfosId] = await (trx || knexDatabase.knex)('organization_additional_infos').insert({
    segment,
    resellers_estimate: resellersEstimate,
    reason,
    plataform
  }).returning('id')

  return attachedOrganizationInfosId;

}

const createOrganization = async (
    createOrganizationPayload : IOrganizationPayload, 
    context: { redisClient: RedisClient, client: IUserToken },
    trx : Transaction
  ) => {

  if(!context.client) throw new Error("invalid token");

  const { 
    organization : { 
      name, contactEmail, phone
    }
  } = createOrganizationPayload;

  try {

    const attachedOrganizationInfosId = await attachOrganizationAditionalInfos(createOrganizationPayload.additionalInfos, trx);

    const [organizationCreated] = await (trx || database.knex)
    .insert({
      name,
      contact_email: contactEmail,
      user_id: context.client.id,
      slug: stringToSlug(name),
      phone,
      free_trial: true,
      free_trial_expires: moment().add(FREE_TRIAL_DAYS, 'days'),
      organization_additional_infos_id: attachedOrganizationInfosId
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

     const [userOrganizationCreated] = await (trx || knexDatabase.knex)('users_organizations').insert({
      user_id: userId,
      organization_id: organizationId,
      invite_status: inviteStatus,
      invite_hash: hashToVerify
     }).returning('*');

     const [organizationRoleId] = await (trx || knexDatabase.knex)('users_organization_roles').insert({
      users_organization_id: userOrganizationCreated.id, 
      organization_role_id: organizationRole.id
     }).returning('users_organization_id');

     return _usersOrganizationsAdapter({...userOrganizationCreated, organization_role_id: organizationRoleId});

}

const organizationRoleByName = async (roleName: OrganizationRoles, trx: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', roleName).select('id');
  return organizationRole;
}

const listTeammates = async (
    context: { organizationId: string }, 
    trx: Transaction
  ) => {

    const teammates = await (trx || knexDatabase.knex)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')
    .innerJoin('users AS u', 'u.id', 'uo.user_id')
    .where('or.name', OrganizationRoles.ADMIN)
    .andWhere('uo.organization_id', context.organizationId)
    .andWhere('uo.active', true)
    .select('uo.*')

    return teammates.map(_usersOrganizationsAdapter);

}

const userTeammatesOrganizationCount = async (organizationId: string, userId: string, emails: string[], trx: Transaction) => {

  const [userOrganizationCreatedId] = await (trx || knexDatabase.knex)('users_organizations AS uo')
    .innerJoin('users_organization_roles AS uor', 'uor.users_organization_id', 'uo.id')
    .innerJoin('organization_roles AS or', 'or.id', 'uor.organization_role_id')
    .innerJoin('users AS u', 'u.id', 'uo.user_id')
    .where('or.name', OrganizationRoles.ADMIN)
    .andWhere('uo.organization_id', organizationId)
    .andWhere('uo.active', true)
    .andWhereNot('uo.user_id', userId)
    .whereNotIn('u.email', emails)
    .count();

  return userOrganizationCreatedId.count;

}

const inviteTeammates = async (
  input : {
    emails: string[]
  },
  context: { organizationId: string, client: IUserToken },
  trx: Transaction
) => {

  const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId);

  const maxTeammates = affiliateTeammateRules.maxTeammates;

  const currentTeammates = await userTeammatesOrganizationCount(context.organizationId, context.client.id, input.emails, trx);

  const uniqueEmails = [...new Set(input.emails)]

  if(uniqueEmails.length > maxTeammates || (Number(currentTeammates) + uniqueEmails.length) > maxTeammates) throw new Error(MESSAGE_ERROR_UPGRADE_PLAN);

  const [organization] = await (trx || knexDatabase.knex)('organizations').where('id', context.organizationId).select('name');

  if(!organization) throw new Error("Organization not found.");

  try {
    let users = await Promise.all(uniqueEmails.map(async item => {

      let hashToVerify = await common.encryptSHA256(JSON.stringify({item, timestamp: +new Date()}));

      const userEmailFound = await UserService.getUserByEmail(item, trx);

      if(userEmailFound){

        const usersOrganizationFound = await getUserOrganizationByIds(userEmailFound.id, context.organizationId, trx);

        if(usersOrganizationFound){

          const [userOrganizationCreatedId] = await (trx || knexDatabase.knex)('users_organizations').update({
            invite_status: OrganizationInviteStatus.PENDENT,
            active: true
            }).where('id', usersOrganizationFound.id).returning('id');

            await MailService.sendInviteUserMail({
            email: item,
            hashToVerify,
            organizationName: organization.name,
          })

          const userInOrganizationService = await ServicesService.getUserInOrganizationServiceByUserOrganizationId({usersOrganizationId: usersOrganizationFound.id}, trx)

          if(userInOrganizationService.length){
            await ServicesService.inativeServiceMembersById(userInOrganizationService.map(item => item.id), trx);
          }

          return userOrganizationCreatedId;

        }

      }

      let userEmail = await UserService.getUserByEmail(item, trx);

      if(!userEmail){
        userEmail = await UserService.signUpWithEmailOnly(item, trx);
      }

      const userOrganizationCreated = await organizationRolesAttach(userEmail.id, context.organizationId, OrganizationRoles.ADMIN , OrganizationInviteStatus.PENDENT, trx, hashToVerify);
  
      await MailService.sendInviteNewUserMail({
        email: userEmail.email,
        hashToVerify,
        organizationName: organization.name
      })

      return userOrganizationCreated;
      
    }))

    return users;
  } catch (error) {
    throw new Error(error.message)
  }

}

const getUserOrganizationByUserOrganizationId = async (usersOrganizationId: string, trx: Transaction) => {

  const userInOrganizationServices = await (trx || knexDatabase.knex)('users_organizations')
    .where('id', usersOrganizationId)

  return userInOrganizationServices;

}

const inviteAffiliateServiceMembers = async (
  input : {
    users: {
      email: string
      role: ServiceRoles
    }[]
  },
  context: { organizationId: string, client: IUserToken },
  trx: Transaction
) => {

  const affiliateTeammateRules = await OrganizationRulesService.getAffiliateTeammateRules(context.organizationId);

  const [organization] = await (trx || knexDatabase.knex)('organizations').where('id', context.organizationId).select('name');

  if(!organization) throw new Error("Organization not found.");

  const vtexSecrets = await VtexService.getSecretsByOrganizationId(context.organizationId, trx); 
  
  if(!vtexSecrets || !vtexSecrets.status) 
    throw new Error("Vtex Integration not implemented")

  const [serviceOrganizationFound] = await ServicesService.serviceOrganizationByName(context.organizationId, Services.AFFILIATE, trx);

  if(!serviceOrganizationFound)
    throw new Error("Organization doesnt have this service");

  try {

    await ServicesService.verifyAffiliateMaxRules(input.users, affiliateTeammateRules, serviceOrganizationFound.id, trx);

    return await Promise.all(input.users.map(async item => {

      let hashToVerify = await common.encryptSHA256(JSON.stringify({...item, timestamp: +new Date()}));

      let userEmail = await UserService.getUserByEmail(item.email, trx);

      if(userEmail){

        const usersOrganizationFound = await getUserOrganizationByIds(userEmail.id, context.organizationId, trx);

        if(usersOrganizationFound){

          const [userOrganizationUpdated] = await (trx || knexDatabase.knex)('users_organizations').update({
            invite_status: OrganizationInviteStatus.PENDENT,
            active: true
            }).where('id', usersOrganizationFound.id).returning('id');

            await MailService.sendInviteUserMail({
            email: item.email,
            hashToVerify,
            organizationName: organization.name,
          })

          const organizationAdmin = await getUserOrganizationByUserOrganizationId(usersOrganizationFound.id, trx)

          if(organizationAdmin.length){
            await changeOrganizationAdminToMember(organizationAdmin.map(item => item.id), trx);
          }

          await ServicesService.attachUserInOrganizationAffiliateService(
            { userOrganizationId: usersOrganizationFound.id , role: item.role, organizationId: context.organizationId, serviceOrganization: serviceOrganizationFound }, 
            trx
          );

          return userOrganizationUpdated;

        }

      } else {
        userEmail = await UserService.signUpWithEmailOnly(item.email, trx);
      }

      const userOrganizationCreated = await organizationRolesAttach(userEmail.id, context.organizationId, OrganizationRoles.MEMBER , OrganizationInviteStatus.PENDENT, trx, hashToVerify);

      await ServicesService.attachUserInOrganizationAffiliateService(
        { userOrganizationId: userOrganizationCreated.id , role: item.role, organizationId: context.organizationId, serviceOrganization: serviceOrganizationFound },  
        trx,
        vtexSecrets
      );
  
      await MailService.sendInviteNewUserMail({
        email: userEmail.email,
        hashToVerify,
        organizationName: organization.name
      })

      return userOrganizationCreated;

    }));

  } catch (error) {
    throw new Error(error.message)
  }

}

const getOrganizationRoleByName = async (organizationRoleName: OrganizationRoles, trx: Transaction) => {
  const [organizationRole] = await (trx || knexDatabase.knex)('organization_roles').where('name', organizationRoleName).select();

  return organizationRole;
}

const changeOrganizationAdminToMember = async (userOrganizationIds: string[], trx: Transaction) => {

  const memberOrganizationRole = await getOrganizationRoleByName(OrganizationRoles.MEMBER, trx);

  await (trx || knexDatabase.knex)('users_organization_roles')
    .update({
      organization_role_id: memberOrganizationRole.id
    })
    .whereIn('users_organization_id', userOrganizationIds)

}

const responseInvite = async (responseInvitePayload : IResponseInvitePayload, trx : Transaction) => {

  const [user] = await (trx || knexDatabase.knex)('users_organizations AS uo')
  .where('invite_hash', responseInvitePayload.inviteHash)
  .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
  .select('usr.encrypted_password', 'usr.username', 'usr.email', 'uo.id AS user_organization_id');

  try {
    await (trx || knexDatabase.knex)('users_organizations')
    .update({
      invite_hash: null,
      invite_status: responseInvitePayload.response
    })
    .where('invite_hash', responseInvitePayload.inviteHash);

    await (trx || knexDatabase.knex)('users_organization_service_roles')
      .update({ active: responseInvitePayload.response === OrganizationInviteStatus.ACCEPT})
      .where('users_organization_id', user.user_organization_id);

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

    if(permission === OrganizationRoles.MEMBER){
      await (trx || knexDatabase.knex)('users_organization_service_roles')
      .update({ active: true})
      .where('users_organization_id', userOrganization.id);
    } else if(permission === OrganizationRoles.ADMIN){
      await (trx || knexDatabase.knex)('users_organization_service_roles')
      .update({ active: false})
      .where('users_organization_id', userOrganization.id);
    }

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
      .select('orgn.*', 'uo.id AS users_organizations_id');

    return organizations.map(_organizationAdapter);
  } catch(e){
    throw new Error(e.message)
  }


}

const organizationDetails = async (
  context: { organizationId: string, client: IUserToken },
  trx: Transaction) => {

  if(!context.client) throw new Error("token must be provided.");

  const [organizations] = await (trx || knexDatabase.knex)('users_organizations AS uo')
      .innerJoin('organizations AS orgn', 'orgn.id', 'uo.organization_id')
      .where('uo.user_id', context.client.id)
      .andWhere('uo.active', true)
      .andWhere('orgn.id', context.organizationId)
      .select('orgn.*', 'uo.id AS users_organizations_id');

  return _organizationAdapter(organizations);

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

const handleServiceMembersActivity = async (
  inativeServiceMembersInput: {userOrganizationId: string, activity: boolean, service: Services}, 
  context: {organizationId: string},
  trx: Transaction
) => {

  const { userOrganizationId, activity, service } = inativeServiceMembersInput;
  
  try {

    const organizationService = await ServicesService.getOrganizationServiceByServiceName({ service, organizationId: context.organizationId }, trx);

    if(!organizationService) throw new Error(MESSAGE_ERROR_ORGANIZATION_SERVICE_DOES_NOT_EXIST);

    await (trx || knexDatabase.knex)('users_organization_service_roles')
    .update({active: activity})
    .where('users_organization_id', userOrganizationId)
    .andWhere('organization_services_id', organizationService.id);

    const hasMoreServices = await ServicesService.getUserInOrganizationServiceByUserOrganizationId({
      usersOrganizationId: userOrganizationId,
      activity: true
    }, trx);

    if(!hasMoreServices.length){
      await _handleMemberActivity({
        userOrganizationId: userOrganizationId, activity: false
      }, trx)
    }

    if(activity){
      await _handleMemberActivity({
        userOrganizationId: userOrganizationId, activity: true
      }, trx)
    }

    return true;
    
  } catch (error) {
    throw new Error(error.message)
  }
  
}

const inativeTeammates = async (
  inativeTeammatesIds: {userOrganizationId: string},
  trx: Transaction
) => {

  const { userOrganizationId } = inativeTeammatesIds;

  const organizationAdmin = await isOrganizationAdmin(userOrganizationId, trx);
  
  if(!organizationAdmin) throw new Error(MESSAGE_ERROR_USER_NOT_TEAMMATE);

  const [userOrganizationInatived] = await (trx || knexDatabase.knex)('users_organizations')
    .update({active: false, invite_hash: null})
    .where('id', userOrganizationId)
    .returning('*');

  return _usersOrganizationsAdapter(userOrganizationInatived);
  
}

const _handleMemberActivity = async (
  input: {userOrganizationId: string, activity: boolean},
  trx: Transaction
) => {

  const { userOrganizationId, activity } = input;

  const organizationAdmin = await isOrganizationAdmin(userOrganizationId, trx);
  
  if(organizationAdmin) throw new Error(MESSAGE_ERROR_USER_TEAMMATE);

  const [userOrganizationInatived] = await (trx || knexDatabase.knex)('users_organizations')
    .update({active: activity })
    .where('id', userOrganizationId)
    .returning('*');

  return _usersOrganizationsAdapter(userOrganizationInatived);
  
}

const reinviteServiceMember = async (
    input: {
      userOrganizationId: string
    }, 
    context: {}, 
    trx: Transaction
  ) => {

    try {
      const usersOrganizationFound = await (trx || knexDatabase.knex)('users_organizations AS uo')
      .innerJoin('users AS usr', 'usr.id', 'uo.user_id')
      .innerJoin('organizations AS org', 'org.id', 'uo.organization_id')
      .where('uo.id', input.userOrganizationId)
      .first()
      .select();
  
      if(!usersOrganizationFound.invite_hash) throw new Error(MESSAGE_ERROR_USER_ALREADY_REPLIED_INVITE);
    
      await MailService.sendInviteNewUserMail({
        email: usersOrganizationFound.email,
        hashToVerify: usersOrganizationFound.invite_hash,
        organizationName: usersOrganizationFound.name
      }) 

      return true;
    } catch (error) {
      throw new Error(error.message)
    }

};

export default {
  reinviteServiceMember,
  handleServiceMembersActivity,
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
  inativeTeammates,
  verifyOrganizationName,
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
  isOrganizationAdmin,
  inviteTeammates,
  inviteAffiliateServiceMembers,
  listTeammates
}
