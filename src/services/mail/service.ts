import Mail from '../../lib/Mail';
import { ISendMail, ISendRecoveryPasswordMail, IMail, ISendInviteUserMail } from "./types";

const sendSignUpMail = async (data: ISendMail) => {

    if(process.env.NODE_ENV === 'test') return;

    try {
        await Mail.sendMail({
            from: 'PlugOne No-reply <noreply@plugone.io>',
            to: `${data.username} <${data.email}>`,
            subject: 'Welcome to PlugOne!',
            html: `Hello, ${data.username}! confirm your registration: http://localhost:3000/verification/${data.hashToVerify}`
        });
    } catch(e){
        throw new Error(e.message)
    }
}

const sendRecoveryPasswordMail = async (data: ISendRecoveryPasswordMail) => {

    if(process.env.NODE_ENV === 'test') return;

    try {
        await Mail.sendMail({
            from: 'PlugOne No-reply <noreply@plugone.io>',
            to: `${data.username} <${data.email}>`,
            subject: 'Recovery PlugOne Password!',
            html: `Hello, ${data.username}, Link para recuperação de senha: http://localhost:3000/recovery-password/${data.hashToVerify}`
        });
    } catch(e){
        throw new Error(e.message)
    }
}

const sendRecoveredPasswordMail = async (data: IMail) => {

    if(process.env.NODE_ENV === 'test') return;

    try {
        await Mail.sendMail({
            from: 'PlugOne No-reply <noreply@plugone.io>',
            to: `${data.username} <${data.email}>`,
            subject: 'Recovered PlugOne Password!',
            html: `Hello, ${data.username}, your password has been changed on our system!`
        });
    } catch(e){
        throw new Error(e.message)
    }
}

const sendInviteUserMail = async (data: ISendInviteUserMail) => {

    if(process.env.NODE_ENV === 'test') return;

    try {
        await Mail.sendMail({
            from: 'PlugOne No-reply <noreply@plugone.io>',
            to: `<${data.email}>`,
            subject: `You haas been invited to ${data.organizationName}!`,
            html: `Hello, 
                \n to accept: http://localhost:3000/member-invited/${data.hashToVerify}?response=accept
                \n to refuse: http://localhost:3000/member-invited/${data.hashToVerify}?response=refuse
                `
        });
    } catch(e){
        throw new Error(e.message)
    }
}

const sendInviteNewUserMail = async (data: ISendInviteUserMail) => {

    if(process.env.NODE_ENV === 'test') return;

    try {
        await Mail.sendMail({
            from: 'PlugOne No-reply <noreply@plugone.io>',
            to: `<${data.email}>`,
            subject: `You haas been invited to Plugone by ${data.organizationName}!`,
            html: `Hello, 
                \n to accept: http://localhost:3000/member-invited/${data.hashToVerify}
                `
        });
    } catch(e){
        throw new Error(e.message)
    }
}

export default {
    sendSignUpMail,
    sendRecoveryPasswordMail,
    sendRecoveredPasswordMail,
    sendInviteUserMail,
    sendInviteNewUserMail
}