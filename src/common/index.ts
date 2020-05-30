import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const genSaltValue = 10;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 50;

const passwordRegex = /^(?:(?=.*?[A-Z])(?:(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=])|(?=.*?[a-z])(?:(?=.*?[0-9])|(?=.*?[-!@#$%^&*()_[\]{},.<>+=])))|(?=.*?[a-z])(?=.*?[0-9])(?=.*?[-!@#$%^&*()_[\]{},.<>+=]))[A-Za-z0-9!@#$%^&*()_[\]{},.<>+=-]{8,}$/g;
const concatSalt = '23123213,.s)S.X-pKSAD12}bZ1{&7y^%kpk2u9V+{mEO%n3HccBYJIKhFujb23123';
const algorith = 'SHA256';

const encrypt = async (data : string) => {
    const salt = await bcrypt.genSalt(genSaltValue);
    const encryptedPassword = await bcrypt.hash(data, salt);
    return encryptedPassword;
}

const encryptSHA256 = (value : string) =>{
  var hash = crypto.createHash(algorith).update(`${value}${concatSalt}`).digest('hex')
  return hash;
}

const passwordIsCorrect = (password: string, encryptedPassword: string) => bcrypt.compareSync(password, encryptedPassword);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const lengthVerify = (word : string, min: number, max: number) => word.length > min && word.length < max;

const verifyPassword = (password : string) => lengthVerify(password, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH) || !!password.match(passwordRegex)?.length

export default {
    encrypt,
    passwordIsCorrect,
    sleep,
    lengthVerify,
    verifyPassword,
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    encryptSHA256
}