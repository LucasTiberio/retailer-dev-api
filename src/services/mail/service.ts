import Mail from '../../lib/Mail';
import { ISendMail, ISendRecoveryPasswordMail, IMail } from "./types";
import common from '../../common';

const SLEEP_MS_TIME_IN_TEST = 2000;

const sendSignUpMail = async (data: ISendMail) => {

    if(process.env.NODE_ENV === 'test') {
        await common.sleep(SLEEP_MS_TIME_IN_TEST);   
    }

    try {
        await Mail.sendMail({
            from: 'PlugOne Robot <robot@plugone.com>',
            to: `${data.username} <${data.email}>`,
            subject: 'Welcome to PlugOne!',
            html: `Hello, ${data.username}! confirm your registration: http://localhost:3000/verification/${data.hashToVerify}`
        });
    } catch(e){
        throw new Error(e.message)
    }
}

const sendRecoveryPasswordMail = async (data: ISendRecoveryPasswordMail) => {

    if(process.env.NODE_ENV === 'test') {
        await common.sleep(SLEEP_MS_TIME_IN_TEST);   
    }

    try {
        await Mail.sendMail({
            from: 'PlugOne Robot <robot@plugone.com>',
            to: `${data.username} <${data.email}>`,
            subject: 'Recovery PlugOne Password!',
            html: `Hello, ${data.username}, Link para recuperação de senha: http://localhost:3000/recovery-password/${data.hashToVerify}`
        });
    } catch(e){
        throw new Error(e.message)
    }
}

const sendRecoveredPasswordMail = async (data: IMail) => {

    if(process.env.NODE_ENV === 'test') {
        await common.sleep(SLEEP_MS_TIME_IN_TEST);   
    }

    try {
        await Mail.sendMail({
            from: 'PlugOne Robot <robot@plugone.com>',
            to: `${data.username} <${data.email}>`,
            subject: 'Recovered PlugOne Password!',
            html: `Hello, ${data.username}, your password has been changed on our system!`
        });
    } catch(e){
        throw new Error(e.message)
    }
}

export default {
    sendSignUpMail,
    sendRecoveryPasswordMail,
    sendRecoveredPasswordMail
}