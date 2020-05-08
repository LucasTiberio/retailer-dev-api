import common from '../../common';
import { Transaction  } from 'knex';
import { ISignIn, ISignInAdapted } from './types';
import UserService from '../users/service';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

declare var process : {
	env: {
	  JWT_SECRET: string
	}
}

const _signInAdapter = (record: ISignInAdapted) => ({
  username: record.username,
  email: record.email,
  id: record.id
});

const generateJwt = (id: string, origin: string) => {
  return jwt.sign({ id, origin }, JWT_SECRET)
}

const signIn = async ({email, password} : ISignIn, trx : Transaction) => {
  let user = await UserService.getUserByEmail(email, trx);

  if(!user) throw new Error('Wrong email/password');

  if(!common.passwordIsCorrect(password, user.encrypted_password)) throw new Error('Wrong email/password');
  
  if(!user.verified) throw new Error("User not verified");
  
  return {
    token: generateJwt(user.id, 'user'),
    user: _signInAdapter(user)
  };
}

export default {
  signIn
}
