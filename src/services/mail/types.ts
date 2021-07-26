export interface IBaseMail {
  whiteLabelInfo?: {
    primaryColor: string;
    organizationId: string;
    secondColor: string;
    tertiaryColor: string;
    logo: string;
    organizationName: string;
    customDomain: string;
  }
}

export interface IMail extends IBaseMail {
  username: string
  email: string
}

export interface ISendMail extends IMail {
  hashToVerify: string
}

export interface ISendRecoveryPasswordMail extends IMail {
  hashToVerify: string
}
export interface ISendInviteUserMail extends IBaseMail {
  email: string
  organizationName: string
  hashToVerify: string
}

export interface ISendSpecialistHelp extends IBaseMail {
  organizationName: string
  id: string
  email: string
}
