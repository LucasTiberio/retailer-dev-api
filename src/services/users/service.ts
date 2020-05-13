import common from '../../common';
import MailService from '../mail/service';
import { ISignUp, ISignUpAdapted, IChangePassword, ISignUpFromDB } from './types';
import { Transaction  } from 'knex';
import database from '../../knex-database';
import knexDatabase from '../../knex-database';

const _signUpAdapter = (record: ISignUpFromDB) => ({
  username: record.username,
  email: record.email,
  id: record.id
});

const signUpWithEmailOnly = async (email: string, trx : Transaction ) => {

  const [partialSignUpCreated] = await (trx || database.knex)
  .insert({
    email
  }).into('users').returning('*')

  return partialSignUpCreated;

}

const signUp = async (attrs : ISignUp, trx : Transaction) => {

  const { username, password, email } = attrs;

  const [userPreAddedFound] = await(trx || knexDatabase.knex)('users')
    .whereRaw("LOWER(email) = LOWER(?)", email) 
    .select('id', 'encrypted_password', 'username');

  if(userPreAddedFound && (userPreAddedFound.encrypted_password || userPreAddedFound.username)) throw new Error("user already registered.");

  const encryptedPassword = await common.encrypt(password);
  const encryptedHashVerification = await common.encrypt(
    JSON.stringify({...attrs, timestamp: +new Date()})
  );

  let signUpCreated : ISignUpFromDB[];

  try {

    if(userPreAddedFound) {

      signUpCreated = await (trx || database.knex)
      .update({
        username,
        encrypted_password: encryptedPassword,
        verification_hash: encryptedHashVerification
      })
      .where('id', userPreAddedFound)
      .into('users').returning('*')
    
    } else {

      signUpCreated = await (trx || database.knex)
      .insert({
        username,
        email,
        encrypted_password: encryptedPassword,
        verification_hash: encryptedHashVerification
      }).into('users').returning('*')

    }


    await MailService.sendSignUpMail({email: signUpCreated[0].email, username: signUpCreated[0].username, hashToVerify: signUpCreated[0].verification_hash})

    return _signUpAdapter(signUpCreated[0]);

  } catch(e){
    trx.rollback();
    throw new Error(e.message)
  }

};

const verifyEmail = async (hash: string, trx: Transaction) => {

  try {
      const [user] = await (trx || database.knex)('users')
          .where('verification_hash', hash)
          .select();     

      if(!user) throw new Error("User already verified!");

      await (trx || database.knex)('users')
          .select()
          .where('verification_hash', hash)
          .update({ verified: true, verification_hash: null });
      
      return true
  } catch(e){
      throw new Error(e.message)
  }

}

const getUserByEmail = async (email: string, trx: Transaction) => {
  const [user] = await (trx || database.knex)('users')
  .where('email', email)
  .select();

  return user
}

const getUserById = async (id: string, trx?: Transaction) => {

  const [user] = await (trx || database.knex)('users')
  .where('id', id)
  .select();

  return user
}

const getUserByNameOrEmail = async (name: string, trx?: Transaction) => {

  const user = await (trx || database.knex)('users')
  .whereRaw(`LOWER(email) LIKE ?`, [`%${name.toLowerCase()}%`])
  .orWhereRaw(`LOWER(username) LIKE ?`, [`%${name.toLowerCase()}%`])
  .select();

  return user;
}

const recoveryPassword = async (email: string, trx: Transaction) => {

  const user = await getUserByEmail(email, trx);

  if(!user) throw new Error("E-mail not found.");

  try {
    
    const encryptedHashVerification = await common.encrypt(
      JSON.stringify({email, timestamp: +new Date()})
    );
  
    await MailService.sendRecoveryPasswordMail({
      email: user.email, 
      username: user.username, 
      hashToVerify: encryptedHashVerification
    })
  
    await (trx || database.knex)('users').where('email', email).update({'verification_hash':encryptedHashVerification, verified: true});

    return true

  } catch(e){
    throw new Error(e.message);
  }

}

const changePassword = async (attrs : IChangePassword, trx : Transaction) => {

  try {
    const encryptedPassword = await common.encrypt(attrs.password);

    const [userPasswordChanged] = await (trx || database.knex)('users').where('verification_hash', attrs.hash).update({'encrypted_password': encryptedPassword, 'verification_hash': null}).returning(['email', 'username']);

    await MailService.sendRecoveredPasswordMail({email: userPasswordChanged.email, username: userPasswordChanged.username})

    return true
  } catch(e) {
    throw new Error(e.message)
  }


}

export default {
  signUp,
  verifyEmail,
  recoveryPassword,
  changePassword,
  getUserByEmail,
  getUserById,
  signUpWithEmailOnly,
  _signUpAdapter,
  getUserByNameOrEmail
}
