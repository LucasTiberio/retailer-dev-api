import common from '../../common';
import MailService from '../mail/service';
import { ISignUp, ISignUpAdapted, IChangePassword } from './types';
import { Transaction  } from 'knex';
import database from '../../knex-database';

const _signUpAdapter = (record: ISignUpAdapted) => ({
  username: record.username,
  email: record.email,
  id: record.id
});

const signUp = async (attrs : ISignUp, trx : Transaction) => {

  const { username, password, email } = attrs;

  const encryptedPassword = await common.encrypt(password);
  const encryptedHashVerification = await common.encrypt(
    JSON.stringify({...attrs, timestamp: +new Date()})
  );

  try {

    const [signUpCreated] = await (trx || database.knex)
    .insert({
      username,
      email,
      encrypted_password: encryptedPassword,
      verification_hash: encryptedHashVerification
    }).into('users').returning('*')

    // await MailService.sendSignUpMail({email: signUpCreated.email, username: signUpCreated.username, hashToVerify: signUpCreated.verification_hash})

    return _signUpAdapter(signUpCreated);

  } catch(e){
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
  getUserByEmail
}
