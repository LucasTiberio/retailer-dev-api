import bcrypt from 'bcryptjs';

const genSaltValue = 10;

const encryptPassword = async (password : string) => {
    const salt = await bcrypt.genSalt(genSaltValue);
    const encryptedPassword = await bcrypt.hash(password, salt);
    return encryptedPassword;
}

const passwordIsCorrect = (password: string, encryptedPassword: string) => bcrypt.compareSync(password, encryptedPassword);

export default {
    encryptPassword,
    passwordIsCorrect
}