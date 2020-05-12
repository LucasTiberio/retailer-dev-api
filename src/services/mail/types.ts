export interface IMail {
    username: string
    email: string
}

export interface ISendMail extends IMail{
    hashToVerify: string
}

export interface ISendRecoveryPasswordMail extends IMail{
    hashToVerify: string
}

export interface ISendInviteUserMail{
    email: string
    organizationName: string
    hashToVerify: string
}