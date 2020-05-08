import bcrypt from 'bcryptjs';

const genSaltValue = 10;

const encrypt = async (data : string) => {
    const salt = await bcrypt.genSalt(genSaltValue);
    const encryptedPassword = await bcrypt.hash(data, salt);
    return encryptedPassword;
}

const passwordIsCorrect = (password: string, encryptedPassword: string) => bcrypt.compareSync(password, encryptedPassword);

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export default {
    encrypt,
    passwordIsCorrect,
    sleep
}