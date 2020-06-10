import common from '../../common';
import { Transaction  } from 'knex';
import { ISignIn, ISignInAdapted } from './types';
import UserService from '../users/service';


const _signInAdapter = (record: ISignInAdapted) => ({
  username: record.username,
  email: record.email,
  id: record.id
});



const signIn = async ({email, password} : ISignIn, trx : Transaction) => {
  let user = await UserService.getUserByEmail(email, trx);

  if(!user) throw new Error('Wrong email/password');

  if(!common.passwordIsCorrect(password, user.encrypted_password)) throw new Error('Wrong email/password');
  
  if(!user.verified) throw new Error("User not verified");
  
  return {
    token: common.generateJwt(user.id, 'user'),
    user: _signInAdapter(user)
  };
}

export default {
  signIn
}
