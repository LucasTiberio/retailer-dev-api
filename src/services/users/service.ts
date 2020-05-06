import common from '../../common';
import { ISignUp } from './types';
const knex = require('../../knex-database').knex;
import { Transaction  } from 'knex';

const signUp = async (attrs : ISignUp, trx : Transaction) => {

  const { username, password, email } = attrs;

  const encryptedPassword = await common.encryptPassword(password);

  try {
    const [signUpCreated] = await (trx || knex)
    .insert({
      username,
      email,
      encrypted_password: encryptedPassword,
    }).into('users').returning('*')

    return signUpCreated;

  } catch(e){
    throw new Error(e.message)
  }

};

export default {
  signUp
}
