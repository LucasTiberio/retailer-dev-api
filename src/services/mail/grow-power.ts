import Mail from '../../lib/Mail'
import { ISendMail, ISendRecoveryPasswordMail, IMail, ISendInviteUserMail, ISendSpecialistHelp } from './types'

const frontUrl = process.env.FRONT_URL

const getBaseUrl = (whiteLabelDomain?: string) => {
  if (whiteLabelDomain) return `https://${whiteLabelDomain}`

  return frontUrl
}

const sendSignUpMail = async (data: ISendMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Grow Power No-Reply <noreply@gohubly.com>',
      to: `${data.username || ''} <${data.email}>`,
      subject: `Bem vindo(a) a ${data?.whiteLabelInfo?.organizationName ?? 'Hubly Retailer'}!`,
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Parceiros Grow Power</title>
        <style type="text/css">
        body p {
            text-align: center;
        }
        body p {
            font-family: Arial, Helvetica, sans-serif;
        }
        </style>
        </head>

        <body>
        <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/Logo%20Grow%20Power%20500px.png" alt="logo" width="300" /></p>
        <p>&nbsp;</p>
        <p><strong>Olá ${data.username}</strong></p>
        <p><br />
        Hoje começa a sua jornada conosco, por isso queremos<br />
        mostrar tudo que você pode fazer com a nossa poderosa ferramenta.<br />
        <br />
        Mas pra isso precisamos que confirme seu e-mail, assim a gente<br />
        garante com segurança que você é você mesmo.</p>
        <p>&nbsp;</p>
        <p>
            <a href="${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/verification/${
                data.hashToVerify
              }">
                <img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/confirmar%20email.png" width="327" height="74" />
            </a>
        </p>
        <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/terra.png" width="50%" /></p>
        </body>
        </html>

          
            `,
    })
  } catch (e) {
    console.log(e)
    throw new Error(e.message)
  }
}

const sendRecoveryPasswordMail = async (data: ISendRecoveryPasswordMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Grow Power No-Reply <noreply@gohubly.com>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Recuperacão de senha Hubly Retailer!',
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>Parceiros Grow Power</title>
      <style type="text/css">
      body p {
          text-align: center;
      }
      body p {
          font-family: Arial, Helvetica, sans-serif;
      }
      </style>
      </head>
      
      <body>
      <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/Logo%20Grow%20Power%20500px.png" alt="logo" width="300" /></p>
      <p>&nbsp;</p>
      <p><strong>Olá ${data.username}</strong></p>
      <p><br />
      Esqueceu sua senha? </p>
      <p>Não se preocupe. Isso acontece...</p>
      <p><br />
        Para escolher uma nova, clique no link abaixo:</p>
      <p>&nbsp;</p>
      <p>
        <a href="${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/recovery-password/change-password/${data.hashToVerify}">
            <img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/escolher.png" width="272" height="72" />
        </a>
      </p>
      <p>
            <img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/terra.png" width="50%" />
      </p>
      </body>
      </html>        
    `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const sendRecoveredPasswordMail = async (data: IMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Grow Power No-Reply <noreply@gohubly.com>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Senha recuperada Hubly Retailer!',
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Parceiros Grow Power</title>
<style type="text/css">
body p {
	text-align: center;
}
body p {
	font-family: Arial, Helvetica, sans-serif;
}
.bb {
	font-weight: bold;
}
.bb {
	font-weight: bold;
}
.bb {
	font-weight: bold;
}
</style>
</head>

<body>
<p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/Logo%20Grow%20Power%20500px.png" alt="logo" width="300" /></p>
<p>&nbsp;</p>
<p><strong>Olá ${data.username}</strong></p>
<p><br />
  <span class="bb">A sua senha da Hubly Retailer foi redefinida.</span> Se você fez isso, pode<br />
desconsiderar este email com segurança.</p>
<p><br />
  Se você<span class="bb"> não</span> solicitou redefinir sua senha,<span class="bb"> entre em contato conosco.</span></p>
<p>&nbsp;</p>
<p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/terra.png" width="50%" /></p>
</body>
</html>

      
            `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const sendInviteUserMail = async (data: ISendInviteUserMail) => {
    if (process.env.NODE_ENV === 'test') return
  
    try {
      await Mail.sendMail({
        from: 'Hubly Retailer No-reply <noreply@gohubly.com>',
        to: `<${data.email}>`,
        subject: `Você foi convidado por ${data.organizationName}!`,
        html: `
  
  <!DOCTYPE html>
  <html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <title>gohubly.com - Email Template</title>
      <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
      <style>
        table {border-collapse: collapse;}
        td,th,div,p,a {font-size: 16px; line-height: 26px;}
        .spacer,.divider,div,p,a,h1,h2,h3,h4,h5,h6 {mso-line-height-rule: exactly;}
        td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family:"Segoe UI",Helvetica,Arial,sans-serif;}
      </style>
      <![endif]-->
  
      <style type="text/css">
          
      html, body, div, span, object, iframe,
      h1, h2, h3, h4, h5, h6, p, blockquote, pre,
      abbr, address, cite, code,
      del, dfn, em, img, ins, kbd, q, samp,
      small, strong, sub, sup, var,
      b, i,
      dl, dt, dd, ol, ul, li,
      fieldset, form, label, legend,
      table, caption, tbody, tfoot, thead, tr, th, td,
      article, aside, canvas, details, figcaption, figure,
      footer, header, hgroup, menu, nav, section, summary,
      time, mark, audio, video {
          margin:0;
          padding:0;
          border:0;
          outline:0;
          font-size:100%;
          vertical-align:baseline;
      }
  
      body {
          line-height:1;
      }
  
      article,aside,details,figcaption,figure,
      footer,header,hgroup,menu,nav,section {
          display:block;
      }
  
  
      a {
          margin:0;
          padding:0;
          font-size:100%;
          vertical-align:baseline;
          background:transparent;
      }
  
  
  
        @media only screen {
          .col, td, th, div, p {font-family: "Inter",-apple-system,system-ui,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;}
          .inter {font-family: 'Inter', sans-serif!important;}
          .btn {
              margin: 48px auto;
              color: #ffffff;
              text-align: center;
              font-weight: 700;
              font-weight: bold;
              font-size: 18px;
              line-height: 24px;
              box-sizing:border-box;
              display: block;
              padding: 16px 32px;
  
              width: 198px;
              height: 56px;
  
              background: linear-gradient(200.34deg, #3C5ED9 -2.42%, #3B24A8 79.51%);
              border-radius: 6px;
          }
        }
  
        #outlook a {padding: 0;}
        img {border: 0; line-height: 100%; vertical-align: middle;}
        .col {font-size: 16px; line-height: 26px; vertical-align: top;}
  
        @media only screen and (max-width: 500px) {
          .wrapper img {max-width: 100%;}
          u ~ div .wrapper {min-width: 100vw;}
          .container {width: 100%!important; -webkit-text-size-adjust: 100%;}
        }
  
        @media only screen and (max-width: 699px) {
          .col {
            box-sizing: border-box;
            display: inline-block!important;
            line-height: 23px;
            width: 100%!important;
          }
  
          .col-1  {max-width: 8.33333%;}
          .col-2  {max-width: 16.66667%;}
          .col-3  {max-width: 25%;}
          .col-4  {max-width: 33.33333%;}
          .col-5  {max-width: 41.66667%;}
          .col-6  {max-width: 50%;}
          .col-7  {max-width: 58.33333%;}
          .col-8  {max-width: 66.66667%;}
          .col-9  {max-width: 75%;}
          .col-8 {max-width: 83.33333%;}
          .col-11 {max-width: 91.66667%;}
  
          .col-push-1  {margin-left: 8.33333%;}
          .col-push-2  {margin-left: 16.66667%;}
          .col-push-3  {margin-left: 25%;}
          .col-push-4  {margin-left: 33.33333%;}
          .col-push-5  {margin-left: 41.66667%;}
          .col-push-6  {margin-left: 50%;}
          .col-push-7  {margin-left: 58.33333%;}
          .col-push-8  {margin-left: 66.66667%;}
          .col-push-9  {margin-left: 75%;}
          .col-push-10 {margin-left: 83.33333%;}
          .col-push-11 {margin-left: 91.66667%;}
  
          .full-width-sm {display: table!important; width: 100%!important;}
          .stack-first {display: table-header-group!important;}
          .stack-last {display: table-footer-group!important;}
          .stack-top {display: table-caption!important; max-width: 100%; padding-left: 0!important;}
  
          .toggle-content {
            max-height: 0;
            overflow: auto;
            transition: max-height .4s linear;
              -webkit-transition: max-height .4s linear;
          }
          .toggle-trigger:hover + .toggle-content,
          .toggle-content:hover {max-height: 999px!important;}
  
          .show-mobile {
            display: inherit!important;
            font-size: inherit!important;
            line-height: inherit!important;
            max-height: none!important;
          }
          .hide-mobile {display: none!important;}
  
          .align-center {
            display: table!important;
            float: none;
            margin-left: auto!important;
            margin-right: auto!important;
          }
          .align-left {float: left;}
          .align-right {float: right;}
  
          .text-center {text-align: center!important;}
          .text-left   {text-align: left!important;}
          .text-right  {text-align: right!important;}
  
          .borderless-sm {border: none!important;}
          .nav-vertical .nav-item {display: block;}
          .nav-vertical .nav-item a {display: inline-block; padding: 4px 0!important;}
  
          .spacer {height: 0;}
  
          .p-0 {padding: 0!important;}
          .p-8 {padding: 8px!important;}
          .p-16 {padding: 16px!important;}
          .p-24 {padding: 24px!important;}
          .p-32 {padding: 32px!important;}
          .pt-0 {padding-top: 0!important;}
          .pt-8 {padding-top: 8px!important;}
          .pt-16 {padding-top: 16px!important;}
          .pt-24 {padding-top: 24px!important;}
          .pt-32 {padding-top: 32px!important;}
          .pr-0 {padding-right: 0!important;}
          .pr-8 {padding-right: 8px!important;}
          .pr-16 {padding-right: 16px!important;}
          .pr-24 {padding-right: 24px!important;}
          .pr-32 {padding-right: 32px!important;}
          .pb-0 {padding-bottom: 0!important;}
          .pb-8 {padding-bottom: 8px!important;}
          .pb-16 {padding-bottom: 16px!important;}
          .pb-24 {padding-bottom: 24px!important;}
          .pb-32 {padding-bottom: 32px!important;}
          .pl-0 {padding-left: 0!important;}
          .pl-8 {padding-left: 8px!important;}
          .pl-16 {padding-left: 16px!important;}
          .pl-24 {padding-left: 24px!important;}
          .pl-32 {padding-left: 32px!important;}
          .pl-48 {padding-left: 48px!important;}
          .px-0 {padding-right: 0!important; padding-left: 0!important;}
          .px-8 {padding-right: 8px!important; padding-left: 8px!important;}
          .px-16 {padding-right: 16px!important; padding-left: 16px!important;}
          .px-24 {padding-right: 24px!important; padding-left: 24px!important;}
          .px-32 {padding-right: 32px!important; padding-left: 32px!important;}
          .py-0 {padding-top: 0!important; padding-bottom: 0!important;}
          .py-8 {padding-top: 8px!important; padding-bottom: 8px!important;}
          .py-16 {padding-top: 16px!important; padding-bottom: 16px!important;}
          .py-24 {padding-top: 24px!important; padding-bottom: 24px!important;}
          .py-32 {padding-top: 32px!important; padding-bottom: 32px!important;}
          .chrink{font-size: 90px !important; line-height: 90px;}
        }
  
  
      </style>
    </head>
    <body style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
  
  
      <div style="display:none;font-size:0;line-height:0;">Você foi convidado para a ${data?.whiteLabelInfo?.organizationName}!</div>
  
        <!-- WRAPPER -->
        <table class="full-width-sm" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" bgcolor="#E5E5E5" style="width: 100%; background-color: #E5E5E5;">
          <tbody>
              <tr>
              <td class="px-24" align="center" style="padding-top: 64px;padding-bottom: 64px;">
                        <!-- CONTAINER -->
                        <table class="full-width-sm" cellspacing="0" cellpadding="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px; margin: 0 auto;">
                           <tbody>
                              <tr>
                          <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:5px;padding-right:5px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:4px;padding-right:4px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                            <td align="" style="">
                                <!-- CONTAINER -->
                                <table class="container" cellpadding="0" cellspacing="0" role="presentation" width="640">
                                  <tr>
                                    <td align="left" class="px-16 py-24">
                      
                                      <!-- section : Logo -->
                                      <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tr>
                                          <td style="padding: 0px;">
                                            <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                              <tr>
                                                <td class="col px-48" align="left" style="padding: 32px 48px;" bgcolor="#FFFFFF">
                                                <img src="${data?.whiteLabelInfo?.logo ?? 'https://plugone-production.nyc3.digitaloceanspaces.com/hubly/retailer/logos/logo-with-text-background-white.png'}" alt="Logo" width="100%" style="max-width: 247px;">
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                      <!-- End Section -->
                      
                      
                      
                                      <!-- section : Banner -->
                                      <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tr>
                                          <td style="padding: 0px;">
                                            <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                              <tr>
                                                <td class="col" align="center" width="400" bgcolor="#FFFFFF" style="padding-left:66px;padding-right: 66px;margin-top:36px">
                                                  <img class="full-width-sm" src="https://plugone-staging.nyc3.digitaloceanspaces.com/email-assets/invite.png" alt="Bem vindo à Hubly Retailer!" width="100%" style="width:100%; max-width: 100%;">
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                      <!-- End Section -->
                      
                      
                                      
                                      <!-- section : Content -->
                                      <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                        <tr>
                                          <td style="padding: 0px;">
                                              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                  <tr>
                                                  <td class="col px-16" bgcolor="#FFFFFF" align="left" width="352" style="padding: 48px 24px 32px 24px;" >
                                                      <h1 class="inter" style="color: #1C1637;font-size: 32px; font-weight: 700; line-height: 36px ; margin-bottom: 20px;text-align: center;">Você foi convidado para a ${data.organizationName}</h1>
                                                      <p class="inter" style="color: #666372;font-size: 16px; font-weight: 500; line-height: 24px ; margin-bottom: 25px; letter-spacing: 0.001em; margin-left:95px;margin-right: 95px;text-align: center;">Você foi convidado para filiar-se à organização ${data.organizationName}. Clique abaixo para aceitar o convite.</p>
                                                      <table border="0" cellpadding="0" cellspacing="0" align="center" class="inter" style="font-family: 'Inter', sans-serif!important;" width="100%">
                                                      <tbody>
                                                          <tr>
                                                              <td align="center" height="36" bgcolor="#3B24A8" width="260" style="width:260px;font-family: 'Inter', sans-serif!important;margin:48px auto;color:#ffffff;text-align:center;font-weight:700;font-weight:bold;font-size:18px;line-height:24px;box-sizing:border-box;display:block;padding:16px 32px;height:56px;background-color:#EB0045;border-radius:6px;color: #ffffff; text-align: center;cursor: pointer;text-decoration: none;margin-bottom: 10px">
                                                                  <a href="${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/member-invited/${data.hashToVerify}/accept" style="color:#ffffff; font-weight:700;font-weight:bold;font-size:18px;line-height:24px;color: #ffffff; text-align: center;cursor: pointer;text-decoration: none;font-family: 'Inter', sans-serif!important;">
                                                                  Aceitar convite
                                                                  </a>
                                                              </td>
                                                          </tr>
                                                      </tbody>
                                                  </table>
                                                  <a href="${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/member-invited/${data.hashToVerify}/refused" class="inter" style="display: block; text-align: center;cursor: pointer;text-decoration: none;">Recusar convite</a>
                                                </td>
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                      <!-- End Section -->
                                      
                      
                                      <!-- section : Bottom Section -->
                                      <table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="padding:0 20px" bgcolor="#FFFFFF">
                                        <tr>
                                          <td class="px-16" style="padding:0 24px;" bgcolor="#FFFFFF">
                                            <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                              <tr>
                      
                                                <td class="col col-6" bgcolor="#FFFFFF" align="left" width="320" style="padding: 32px 0px 32px 0px; border-top: 2px solid #EDF2F7; line-height: 12px!important;margin-left:48px" >
                                                  <a href="#" class="inter" style="color: #666372;font-size: 12px; font-weight: 500; line-height: 42px!important; text-decoration: none;">Enviado por <span style="color:#EB0045;">${data?.whiteLabelInfo?.organizationName ?? 'Hubly Retailer'}</span></a>
                                                </td>
                      
                                                <td class="col col-6" bgcolor="#FFFFFF" align="right" width="320" style="padding: 32px 0px 32px 0px; border-top: 2px solid #EDF2F7;line-height: 12px!important;" >
                                                <a href="https://www.instagram.com/gohubly/" class="inter" style="color: #3C5ED9;font-size: 12px; font-weight: 500; line-height: 12px!important; text-decoration: none;margin-right:15px;">
                                                <img src="https://plugone-production.nyc3.digitaloceanspaces.com/hubly/email-assets/instagram.png" alt="instagram" width="38px" style="width: 38px; max-width: 38px;">
                                                </a>
                                                <a href="https://www.linkedin.com/company/gohubly/" class="inter" style="color: #3C5ED9;font-size: 12px; font-weight: 500; line-height: 12px!important; text-decoration: none;">
                                                  <img src="https://plugone-production.nyc3.digitaloceanspaces.com/hubly/email-assets/linkedin.png" alt="linkedin" width="38px" style="width: 38px; max-width: 38px;">
                                                </a>
                                                </td>
                      
                                              </tr>
                                            </table>
                                          </td>
                                        </tr>
                                      </table>
                                      <!-- End Section -->
                                    </td>
                                  </tr>
                                </table>
                                <!-- /CONTAINER -->
                          </td>
                        </tr>
                      <tr>
                        <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-left:4px;padding-right:4px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-left:5px;padding-right:5px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;">
                          <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                        </td>
                      </tr>
                           </tbody>
                        </table>
                        <!-- /CONTAINER -->
              </td>
            </tr>
            <!-- UNSUBSCRIBE -->
            <!--
            <tr>
                <td align="center" style="padding-bottom: 60px; padding-top: 40px;">
                    <a href="*|UNSUB|*" style="font-family: Inter, sans-serif; font-size: 14px; line-height: 16px; font-weight: normal; text-decoration: underline; color: #ffffff;">Unsubscribe</a>
              </td>
            </tr>
            -->
            <!-- /UNSUBSCRIBE -->
          </tbody>
        </table>
        <!-- /WRAPPER -->
  
  
    </body>
  </html>
                  `,
      })
    } catch (e) {
      throw new Error(e.message)
    }
  }

const sendHelpToSpecialist = async (data: ISendSpecialistHelp, bucket: any, pixelPath: any) => {
  if (process.env.NODE_ENV === 'test') return

  await Mail.sendMail({
    from: 'Grow Power No-Reply <noreply@gohubly.com>',
    to: `<${data.email}>`,
    subject: `Você foi requisitado para ajudar ${data.organizationName} na Hubly Retailer`,
    html: `
    <!DOCTYPE html>
    <html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <title>gohubly.com - Email Template</title>
        <!--[if mso]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <style>
          table {border-collapse: collapse;}
          td,th,div,p,a {font-size: 16px; line-height: 26px;}
          .spacer,.divider,div,p,a,h1,h2,h3,h4,h5,h6 {mso-line-height-rule: exactly;}
          td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family:"Segoe UI",Helvetica,Arial,sans-serif;}
        </style>
        <![endif]-->
    
        <style type="text/css">
            
        html, body, div, span, object, iframe,
        h1, h2, h3, h4, h5, h6, p, blockquote, pre,
        abbr, address, cite, code,
        del, dfn, em, img, ins, kbd, q, samp,
        small, strong, sub, sup, var,
        b, i,
        dl, dt, dd, ol, ul, li,
        fieldset, form, label, legend,
        table, caption, tbody, tfoot, thead, tr, th, td,
        article, aside, canvas, details, figcaption, figure,
        footer, header, hgroup, menu, nav, section, summary,
        time, mark, audio, video {
            margin:0;
            padding:0;
            border:0;
            outline:0;
            font-size:100%;
            vertical-align:baseline;
        }
    
        body {
            line-height:1;
        }
    
        article,aside,details,figcaption,figure,
        footer,header,hgroup,menu,nav,section {
            display:block;
        }
    
    
        a {
            margin:0;
            padding:0;
            font-size:100%;
            vertical-align:baseline;
            background:transparent;
        }
    
    
    
          @media only screen {
            .col, td, th, div, p {font-family: "Inter",-apple-system,system-ui,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;}
            .inter {font-family: 'Inter', sans-serif!important;}
            .btn {
                margin: 48px auto;
                color: #ffffff;
                text-align: center;
                font-weight: 700;
                font-weight: bold;
                font-size: 18px;
                line-height: 24px;
                box-sizing:border-box;
                display: block;
                padding: 16px 32px;
    
                width: 198px;
                height: 56px;
    
                background: linear-gradient(200.34deg, #3C5ED9 -2.42%, #3B24A8 79.51%);
                border-radius: 6px;
            }
          }
    
          #outlook a {padding: 0;}
          img {border: 0; line-height: 100%; vertical-align: middle;}
          .col {font-size: 16px; line-height: 26px; vertical-align: top;}
    
          @media only screen and (max-width: 500px) {
            .wrapper img {max-width: 100%;}
            u ~ div .wrapper {min-width: 100vw;}
            .container {width: 100%!important; -webkit-text-size-adjust: 100%;}
          }
    
          @media only screen and (max-width: 699px) {
            .col {
              box-sizing: border-box;
              display: inline-block!important;
              line-height: 23px;
              width: 100%!important;
            }
    
            .col-1  {max-width: 8.33333%;}
            .col-2  {max-width: 16.66667%;}
            .col-3  {max-width: 25%;}
            .col-4  {max-width: 33.33333%;}
            .col-5  {max-width: 41.66667%;}
            .col-6  {max-width: 50%;}
            .col-7  {max-width: 58.33333%;}
            .col-8  {max-width: 66.66667%;}
            .col-9  {max-width: 75%;}
            .col-8 {max-width: 83.33333%;}
            .col-11 {max-width: 91.66667%;}
    
            .col-push-1  {margin-left: 8.33333%;}
            .col-push-2  {margin-left: 16.66667%;}
            .col-push-3  {margin-left: 25%;}
            .col-push-4  {margin-left: 33.33333%;}
            .col-push-5  {margin-left: 41.66667%;}
            .col-push-6  {margin-left: 50%;}
            .col-push-7  {margin-left: 58.33333%;}
            .col-push-8  {margin-left: 66.66667%;}
            .col-push-9  {margin-left: 75%;}
            .col-push-10 {margin-left: 83.33333%;}
            .col-push-11 {margin-left: 91.66667%;}
    
            .full-width-sm {display: table!important; width: 100%!important;}
            .stack-first {display: table-header-group!important;}
            .stack-last {display: table-footer-group!important;}
            .stack-top {display: table-caption!important; max-width: 100%; padding-left: 0!important;}
    
            .toggle-content {
              max-height: 0;
              overflow: auto;
              transition: max-height .4s linear;
                -webkit-transition: max-height .4s linear;
            }
            .toggle-trigger:hover + .toggle-content,
            .toggle-content:hover {max-height: 999px!important;}
    
            .show-mobile {
              display: inherit!important;
              font-size: inherit!important;
              line-height: inherit!important;
              max-height: none!important;
            }
            .hide-mobile {display: none!important;}
    
            .align-center {
              display: table!important;
              float: none;
              margin-left: auto!important;
              margin-right: auto!important;
            }
            .align-left {float: left;}
            .align-right {float: right;}
    
            .text-center {text-align: center!important;}
            .text-left   {text-align: left!important;}
            .text-right  {text-align: right!important;}
    
            .borderless-sm {border: none!important;}
            .nav-vertical .nav-item {display: block;}
            .nav-vertical .nav-item a {display: inline-block; padding: 4px 0!important;}
    
            .spacer {height: 0;}
    
            .p-0 {padding: 0!important;}
            .p-8 {padding: 8px!important;}
            .p-16 {padding: 16px!important;}
            .p-24 {padding: 24px!important;}
            .p-32 {padding: 32px!important;}
            .pt-0 {padding-top: 0!important;}
            .pt-8 {padding-top: 8px!important;}
            .pt-16 {padding-top: 16px!important;}
            .pt-24 {padding-top: 24px!important;}
            .pt-32 {padding-top: 32px!important;}
            .pr-0 {padding-right: 0!important;}
            .pr-8 {padding-right: 8px!important;}
            .pr-16 {padding-right: 16px!important;}
            .pr-24 {padding-right: 24px!important;}
            .pr-32 {padding-right: 32px!important;}
            .pb-0 {padding-bottom: 0!important;}
            .pb-8 {padding-bottom: 8px!important;}
            .pb-16 {padding-bottom: 16px!important;}
            .pb-24 {padding-bottom: 24px!important;}
            .pb-32 {padding-bottom: 32px!important;}
            .pl-0 {padding-left: 0!important;}
            .pl-8 {padding-left: 8px!important;}
            .pl-16 {padding-left: 16px!important;}
            .pl-24 {padding-left: 24px!important;}
            .pl-32 {padding-left: 32px!important;}
            .pl-48 {padding-left: 48px!important;}
            .px-0 {padding-right: 0!important; padding-left: 0!important;}
            .px-8 {padding-right: 8px!important; padding-left: 8px!important;}
            .px-16 {padding-right: 16px!important; padding-left: 16px!important;}
            .px-24 {padding-right: 24px!important; padding-left: 24px!important;}
            .px-32 {padding-right: 32px!important; padding-left: 32px!important;}
            .py-0 {padding-top: 0!important; padding-bottom: 0!important;}
            .py-8 {padding-top: 8px!important; padding-bottom: 8px!important;}
            .py-16 {padding-top: 16px!important; padding-bottom: 16px!important;}
            .py-24 {padding-top: 24px!important; padding-bottom: 24px!important;}
            .py-32 {padding-top: 32px!important; padding-bottom: 32px!important;}
            .chrink{font-size: 90px !important; line-height: 90px;}
          }
    
    
        </style>
      </head>
      <body style="box-sizing:border-box;margin:0;padding:0;width:100%;word-break:break-word;-webkit-font-smoothing:antialiased;">
    
    
        <div style="display:none;font-size:0;line-height:0;">Você foi convidado para a ${data.organizationName}!</div>
    
          <!-- WRAPPER -->
          <table class="full-width-sm" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" bgcolor="#E5E5E5" style="width: 100%; background-color: #E5E5E5;">
            <tbody>
              <tr>
                <td class="px-24" align="center" style="padding-top: 64px;padding-bottom: 64px;">
                  <!-- CONTAINER -->
                  <table class="full-width-sm" cellspacing="0" cellpadding="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px; margin: 0 auto;">
                     <tbody>
                        <tr>
                          <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:5px;padding-right:5px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:4px;padding-right:4px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="" style="">
                            <!-- CONTAINER -->
                                  <table class="container" cellpadding="0" cellspacing="0" role="presentation" width="640">
                                    <tr>
                                      <td align="left" class="px-16 py-24">
                        
                                        <!-- section : Logo -->
                                        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                          <tr>
                                            <td style="padding: 0px;">
                                              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                <tr>
                                                  <td class="col px-48" align="left" style="padding: 32px 48px;" bgcolor="#FFFFFF">
                                                  <img src="${data?.whiteLabelInfo?.logo ?? 'https://plugone-production.nyc3.digitaloceanspaces.com/hubly/retailer/logos/logo-with-text-background-white.png'}" alt="Logo" width="100%" style="max-width: 247px;">
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                        <!-- End Section -->
                        
                        
                        
                                        <!-- section : Banner -->
                                        <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                          <tr>
                                            <td style="padding: 0px;">
                                              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                <tr>
                                                  <td class="col" width="400" bgcolor="#FFFFFF" style="padding-left:66px;padding-right: 66px;margin-top:36px">
                                                    <p>Olá, ${data.organizationName} precisa de sua ajuda para instalar um snippet javascript em seu site para mesclar os dados de engajamento com suas métricas financeiras. Deve demorar apenas 10 minutos.</p>
                                                    <p>Algumas funcionalidades da Hubly Retailer precisam que você adicione um pouco de JavaScript ao seu aplicativo para que ele possa identificar quando seus vendedores internos fazem login no seu e-commerce ou para criar as vitrines digitais.</p>
                                                    <p>As instruções estão abaixo - mas se você tiver alguma dúvida, por favor nos avise.</p>
                                                    <h2 id="instru-es-de-instala-o">Instruções de instalação</h2>
                                                    <h2 id="vis-o-geral">Visão geral</h2>
                                                    <p>Cole o código da Hubly Retailer antes do fechamento da tag body (&lt;/body&gt;) de todas as páginas de sua loja (geralmente coloca-se junto ao footer).</p>
                                                    <br/>
                                                    <hr/>
                                                    <br/>
                                                    <div style="background: #EBEEF4;padding:16px;margin-bottom:32px">
                                                      &lt;script id=&quot;plugone-inside-sales-pixel&quot;&gt; (function (window, document, organizationId) { const __plugone = window.__plugone || {}; __plugone.organizationId = organizationId || &quot;&quot;; window.__plugone = __plugone; const scripts = document.getElementsByTagName(&quot;script&quot;)[0]; const pixel = document.createElement(&quot;script&quot;); pixel.async = true; pixel.src = &quot;${bucket}${pixelPath}&quot;; scripts.parentNode.insertBefore(pixel, scripts); })(window, document, &quot;${data.id}&quot;); &lt;/script&gt;
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                        <!-- End Section -->
                        
                                        <!-- section : Bottom Section -->
                                        <table cellpadding="0" cellspacing="0" role="presentation" width="100%" style="padding:0 20px" bgcolor="#FFFFFF">
                                          <tr>
                                            <td class="px-16" style="padding:0 24px;" bgcolor="#FFFFFF">
                                              <table cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                                <tr>
                        
                                                  <hr/>
                        
                                                  <td class="col col-6" bgcolor="#FFFFFF" align="right" width="320" style="padding: 32px 0px 32px 0px;line-height: 12px!important;" >
                                                               <a href="https://www.instagram.com/gohubly/" class="inter" style="color: #3C5ED9;font-size: 12px; font-weight: 500; line-height: 12px!important; text-decoration: none;margin-right:15px;">
                                                                  <img src="https://plugone-production.nyc3.digitaloceanspaces.com/hubly/email-assets/instagram.png" alt="instagram" width="38px" style="width: 38px; max-width: 38px;">
                                                                </a>
                                                                <a href="https://www.linkedin.com/company/gohubly/" class="inter" style="color: #3C5ED9;font-size: 12px; font-weight: 500; line-height: 12px!important; text-decoration: none;">
                                                                    <img src="https://plugone-production.nyc3.digitaloceanspaces.com/hubly/email-assets/linkedin.png" alt="linkedin" width="38px" style="width: 38px; max-width: 38px;">
                                                                  </a>
                                                  </td>
                        
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                        <!-- End Section -->
                                      </td>
                                    </tr>
                                  </table>
                            <!-- /CONTAINER -->
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:4px;padding-right:4px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:5px;padding-right:5px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;">
                            <div class="full-width-sm" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                          </td>
                        </tr>
                     </tbody>
                  </table>
                  <!-- /CONTAINER -->
                </td>
              </tr>
              <!-- UNSUBSCRIBE -->
              <!--
              <tr>
                <td align="center" style="padding-bottom: 60px; padding-top: 40px;">
                  <a href="*|UNSUB|*" style="font-family: Inter, sans-serif; font-size: 14px; line-height: 16px; font-weight: normal; text-decoration: underline; color: #ffffff;">Unsubscribe</a>
                </td>
              </tr>
              -->
              <!-- /UNSUBSCRIBE -->
            </tbody>
          </table>
          <!-- /WRAPPER -->
    
    
      </body>
    </html>
    `,
  })
}

const sendInviteNewUserMail = async (data: ISendInviteUserMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Grow Power No-Reply <noreply@gohubly.com>',
      to: `<${data.email}>`,
      subject: `Você foi convidado à Hubly Retailer por ${data.organizationName}!`,
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <title>Parceiros Grow Power</title>
      <style type="text/css">
      .a {
          text-align: center;
          font-family: Arial, Helvetica, sans-serif;
      }
      </style>
      </head>
      
      <body class="a">
      <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/Logo%20Grow%20Power%20500px.png" alt="logo" width="30%" /></p>
      <p>&nbsp;</p>
      <p><strong>Seja muito bem-vindo(a)!</strong></p>
      <p><br />
        Você foi convidado à ultilizar a plataforma de Parceiros Grow Power</p>
      <p>Clique no botão abaixo para aceitar o convite</p>
      <p>&nbsp;</p>
      <p>
        <a href="${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/member-invited/${data.hashToVerify}/accept">
            <img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/aceitar.png" width="275" height="77" />
        </a>
      </p>
      <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/terra.png" width="50%" /></p>
      </body>
      </html>
      `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  sendSignUpMail, // feito
  sendRecoveryPasswordMail, // feito
  sendRecoveredPasswordMail, // feito
  sendInviteUserMail, // to do
  sendInviteNewUserMail, // to do
  sendHelpToSpecialist, //feito
}
