import Mail from '../../lib/Mail'
import { ISendMail, ISendInviteUserMail } from './types'

const frontUrl = 'https://afiliados.madesa.com'

const sendSignUpMail = async (data: ISendMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Madesa No-reply <noreply@plugone.io>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Bem vindo(a) ao Programa de Afiliados Madesa!',
      html: `
      <!doctype html>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <title> Madesa </title>
    <!--[if !mso]>
      <!-- -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css"> #outlook a {padding: 0; } body {margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; } table, td {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; } img {border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; } p {display: block; margin: 13px 0; } </style>
    <!--[if mso]>
    <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <!--[if lte mso 11]>
    <style type="text/css"> .mj-outlook-group-fix { width:100% !important; } </style>
    <![endif]-->
    <!--[if !mso]>
      <!-->
        <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
        <link href='https://fonts.googleapis.com/css?family=Montserrat' rel='stylesheet'>
        <style type="text/css"> @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700); </style>
        <!--<![endif]-->
          <style type="text/css"> @media screen {@font-face {font-family: 'ProximaNova'; font-style: normal; font-weight: 400; src: local('ProximaNova'), local('ProximaNova'), url("https://cdn-static.article.com/4fbab950466f96893a963716ea08ea0413682dff/public/fonts/ProximaNova-Regular.woff") format('woff2') } @font-face {font-family: 'ProximaNova Light'; font-style: normal; font-weight: 400; src: local('ProximaNova Light'), local('ProximaNova-Light'), url("https://cdn-static.article.com/4545f2eebdd9037f7424705c6226cf5ab28698ea/public/fonts/ProximaNova-Light.woff") format('woff2') } @font-face {font-family: 'ProximaNova Semibold'; font-style: normal; font-weight: 400; src: local('ProximaNova Semibold'), local('ProximaNova-Semibold'), url("https://cdn-static.article.com/4545f2eebdd9037f7424705c6226cf5ab28698ea/public/fonts/ProximaNova-Semibold.woff") format('woff2') } } </style>
          <style type="text/css"> @media only screen and (min-width:599px) {.mj-column-per-20 {width: 20% !important; max-width: 20%; } .mj-column-per-80 {width: 80% !important; max-width: 80%; } .mj-column-per-100 {width: 100% !important; max-width: 100%; } .mj-column-per-60 {width: 60% !important; max-width: 60%; } .mj-column-per-40 {width: 40% !important; max-width: 40%; } .mj-column-per-50 {width: 50% !important; max-width: 50%; } .mj-column-px-400 {width: 400px !important; max-width: 400px; } .mj-column-per-18 {width: 18% !important; max-width: 18%; } .mj-column-per-26 {width: 26% !important; max-width: 26%; } .mj-column-per-2 {width: 2% !important; max-width: 2%; } .mj-column-per-75 {width: 75% !important; max-width: 75%; } .mj-column-per-24 {width: 24% !important; max-width: 24%; } } </style>
          <style type="text/css"> @media only screen and (max-width:599px) {table.mj-full-width-mobile {width: 100% !important; } td.mj-full-width-mobile {width: auto !important; } } </style>
          <style type="text/css"> @media only screen and (max-width:599px) {.display-none {display: none !important; } } .fade {opacity: 1 !important; } .fade:hover {opacity: 0.7 !important; } .transition_hover {transition: opacity 0.3s ease-in-out, border-radius 0.3s linear, border 0.3s linear !important; } .transition_hover:hover {transition: opacity 0.3s ease-in-out, border-radius 0.3s linear, border 0.3s linear !important; } </style>
        </head>
        <body>
          <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden; mso-hide: all;"> &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌‌ </div>
          <div style="">
                <!-- -------------- BANNER LOGO--------------------- -->
    
    <!--[if mso | IE]>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600">
    <tr>
    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
    <![endif]-->
      <div style="background:#f4eff4;background-color:#f4eff4;margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4eff4;background-color:#f4eff4;width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="vertical-align:top;width:600px;">
    <![endif]-->
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          <tr>
            <td align="center" style="font-size:0px;padding:0px;word-break:break-word;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                <tbody>
                  <tr>
                    <td style="width:600px;">
                      <a class="fade transition_hover" href="https://loja.madesa.com/?utm_term=header_banner" target="_blank">
                        <img class="fade transition_hover"alt="Confirmação de e-mail | Madesa" height="auto" src="https://madesa.s3.sa-east-1.amazonaws.com/Emails_afiliados/Header+email+2.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="Confirmação de e-mail | Madesa" width="600"/>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600">
    <tr>
    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
    <![endif]-->
      <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="vertical-align:top;width:580px;">
    <![endif]-->
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          <tr>
            <td align="center" style="font-size:0px;padding:0px;word-break:break-word;">
              <div style="font-family:'ProximaNova', Arial, sans-serif;font-size:21px;line-height:26px;text-align:center;color:#24292E;">
                <b>Olá ${`, ${data.username}` || ''}!</b>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size:0px;padding:25px;word-break:break-word;">
              <div style="font-family:'ProximaNova', Arial, sans-serif;font-size:18px;line-height:26px;text-align:left;color:#24292E;"> Hoje começa a sua jornada como Afiliado Madesa. </div>
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    <tr>
      <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="vertical-align:middle;width:300px;">
    <![endif]-->
      <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:center;direction:ltr;display:inline-block;vertical-align:middle;width:100%;max-width:299px;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
          <tr>
            <td align="center" style="vertical-align:middle;font-size:0px;padding:0px;word-break:break-word;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                <tbody>
                  <tr>
                    <td align="center" style="width:299px;">
                      <a class="fade transition_hover" href="https://loja.madesa.com/?utm_term=produto1" target="_blank">
                        <img class="fade transition_hover" height="auto" src="https://madesa.s3.sa-east-1.amazonaws.com/Emails_afiliados/1(2).png" style="vertical-align:middle;border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="Confirmação de e-mail | Madesa" alt="Confirmação de e-mail | Madesa" width="299"/>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    <td class="" style="vertical-align:middle;width:300px;">
    <![endif]-->
      <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;max-width:299px;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
          <tr>
            <td align="left" style="vertical-align:middle;font-size:0px;padding:20px;word-break:break-word;">
              <div style="vertical-align:middle;font-family:'ProximaNova', Arial, sans-serif;font-size:18px;line-height:26px;text-align:left;color:#24292E;"> Para começar, precisamos que você confirme seu e-mail para garantirmos com segurança que você é você mesmo. </div>
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    <tr>
      <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="vertical-align:middle;width:300px;">
    <![endif]-->
      <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:center;direction:ltr;display:inline-block;vertical-align:middle;width:100%;max-width:299px;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
          <tr>
            <td align="center" style="vertical-align:middle;font-size:0px;padding:0px;word-break:break-word;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                <tbody>
                  <tr>
                    <td align="center" style="width:299px;">
                      <a class="fade transition_hover" href="https://loja.madesa.com/?utm_term=produto1" target="_blank">
                        <img class="fade transition_hover" height="auto" src="https://madesa.s3.sa-east-1.amazonaws.com/Emails_afiliados/2(2).png" style="vertical-align:middle;border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="Informações adicionais no Hubly Form | Madesa" alt="Informações adicionais no Hubly Form | Madesa" width="299"/>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    <td class="" style="vertical-align:middle;width:300px;">
    <![endif]-->
      <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;max-width:299px;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
          <tr>
            <td align="left" style="vertical-align:middle;font-size:0px;padding:20px;word-break:break-word;">
              <div style="vertical-align:middle;font-family:'ProximaNova', Arial, sans-serif;font-size:18px;line-height:26px;text-align:left;color:#24292E;"> O segundo passo é preencher as informações adicionais no menu “Hubly Form” disponível no painel da ferramenta, no lado esquerdo da tela. </div>
            </td>
          </tr>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    <tr>
      <td style="direction:ltr;font-size:0px;padding:10px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="vertical-align:top;width:560px;">
    <![endif]-->
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          <tr>
            <td align="center" style="font-size:0px;padding:25px;word-break:break-word;">
              <div style="font-family:'ProximaNova', Arial, sans-serif;font-size:18px;line-height:26px;text-align:left;color:#24292E;">Caso você tenha alguma dúvida, entre em contato pelo e-mail <b>afiliados@madesa.com</b> ou pelo <b>Whatsapp,</b>
                <a class="fade transition_hover" href="https://api.whatsapp.com/send?phone=555191508089?utm_term=whatsapp" target="_blanck" style="text-decoration:none; color: #24292E; line-height:24px">
                  <b>clicando aqui.</b>
                </a>
              </div>
            </td>
          </tr>
        </table>
      </div>
      <!-- ----------- BOTÃO --------- -->
    <!--[if mso | IE]>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:300px;" width="300" >
    <tr>
    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
    <![endif]-->
      <tr>
        <td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:300px;line-height:100%;">
            <tr>
              <td align="center" bgcolor="#E11923" role="presentation" style="border:none;border-radius:10px;cursor:auto;mso-padding-alt:10px 25px;background:#E11923;" valign="middle">
                <a href="${frontUrl}/verification/${data.hashToVerify}" style="display:inline-block;width:250px;background:#E11923;color:#ffffff;font-family:ProximaNova, Arial, sans-serif;font-size:16px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:10px;" target="_blank">Confirmar E-mail e ativar conta </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    <tr>
      <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="vertical-align:top;width:600px;">
    <![endif]-->
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
          <tr>
            <td style="font-size:0px;padding:50px 25px 0px 25px;word-break:break-word;">
              <p style="border-top:solid 1px red;font-size:1px;margin:0px auto;width:75%;">
              </p>
    <!--[if mso | IE]>
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px grey;font-size:1px;margin:0px auto;width:400px;" role="presentation" width="400px">
    <tr>
    <td style="height:0;line-height:0;"> &nbsp; </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    </table>
    </div>
    <!-- ------- REDES SOCIAIS ------ -->
    <!--[if mso | IE]>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" >
    <tr>
    <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
    <![endif]-->
      <div  style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
          <tbody>
            <tr>
              <td style="direction:ltr;font-size:0px;padding:10px 10px 10px 300px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
    <tr>
    <td class="" style="width:290px;" >
    <![endif]-->
      <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
    <!--[if mso | IE]>
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" >
    <tr>
    <td style="vertical-align:top;width:145px;" >
    <![endif]-->
      <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:50%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tbody>
            <tr>
              <td  style="background-color:#ffffff;vertical-align:top;padding:10px 0px 0px 0px;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                  <tbody>
                    <tr>
                      <td align="right" style="font-size:0px;padding:10px 0px 10px 5px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td  style="width:50px;">
                                <a href="https://www.instagram.com/madesamoveis/?utm_term=footer_instagram" target="_blank">
                                  <img alt="Instagram | Madesa" height="auto" src="https://madesa.s3.sa-east-1.amazonaws.com/Emails_afiliados/ig.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="Instagram | Madesa" width="50"/>
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    <td style="vertical-align:top;width:145px;" >
    <![endif]-->
      <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:50%;">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
          <tbody>
            <tr>
              <td  style="background-color:#ffffff;vertical-align:top;padding:10px 0px 0px 0px;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 0px 10px 5px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td  style="width:50px;">
                                <a href="https://www.youtube.com/channel/UCCTJyZaZsozHvZgU0TZNnmg?utm_term=footer_youtube" target="_blank">
                                  <img alt="Youtube | Madesa" height="auto" src="https://madesa.s3.sa-east-1.amazonaws.com/Emails_afiliados/yt.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="Youtube | Madesa" width="50"/>
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    </tbody>
    </table>
    </div>
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
      <!-- --- FIM REDES SOCIAIS --- -->
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    <!--[if mso | IE]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </td>
    </tr>
    </div>
    </body>
    </html>
      `,
    })
  } catch (e) {
    console.log(e)
    throw new Error(e.message)
  }
}

const sendInviteNewUserMail = async (data: ISendInviteUserMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
        from: 'Madesa No-reply <noreply@plugone.io>',
        to: `<${data.email}>`,
        subject: 'Programa de Afiliados Madesa',
        html: `
        <!doctype html>
        <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <title>
          </title>
      <!--[if !mso]>
        <!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style type="text/css"> #outlook a { padding:0; } body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; } table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; } img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; } p { display:block;margin:13px 0; } </style>
      <!--[if mso]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]-->
      <!--[if lte mso 11]>
      <style type="text/css"> .mj-outlook-group-fix { width:100% !important; } </style>
      <![endif]-->
        <style type="text/css"> @media only screen and (min-width:480px) {.mj-column-per-100 { width:100% !important; max-width: 100%; } } </style>
        <style type="text/css"> @media only screen and (max-width:480px) {table.mj-full-width-mobile { width: 100% !important; } td.mj-full-width-mobile { width: auto !important; } } </style>
      </head>
      <body style="word-spacing:normal;background-color:#fafafa;">
        <div style="display:none;font-size:1px;color:#fafafa;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;"> &nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌ </div>
        <div style="background-color:#fafafa;">
          <!-- -------------- BANNER LOGO--------------------- -->
      <!--[if mso | IE]>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" >
      <tr>
      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
        <div  style="background:#fafafa;background-color:#fafafa;margin:0px auto;max-width:600px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fafafa;background-color:#fafafa;width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">
      <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
      <td class="" style="vertical-align:top;width:590px;" >
      <![endif]-->
        <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td  style="background-color:#ffffff;vertical-align:top;padding:0 0 0 0;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" style="font-size:0px;padding:0 0 0 0;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:0 0 0 0;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                            <tbody>
                              <tr>
                                <td  style="width:590px;">
                                  <a href="?????????" target="_blank">
                                    <img alt="Afiliados | Madesa" height="auto" src="https://madesa.s3.sa-east-1.amazonaws.com/Emails_afiliados/Header+email+1.png" style="border:0;border-radius:0px;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title="Afiliados | Madesa" width="590"/>
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <!-- --------- TEXTO ---------- -->
                      <tr>
                        <td align="center" style="font-size:0px;padding:20px 0px 0px 20px;word-break:break-word;">
                          <div style="font-family:Arial, sans-serif;font-size:32px;letter-spacing:1px;line-height:36px;text-align:center;color:#24292E;">
                            <b>Bem vind@ ao Programa de Afiliados Madesa!</b>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:25px 50px 20px 50px;word-break:break-word;">
                          <div style="font-family:Arial, sans-serif;font-size:18px;letter-spacing:1px;line-height:28px;text-align:center;color:#24292E;">Você foi convidado para participar do programa de afiliados. Clique abaixo para aceitar o convite.</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <!--[if mso | IE]>
      </td>
      </tr>
      </table>
      <![endif]-->
      </td>
      </tr>
      </tbody>
      </table>
      </div>
      <!--[if mso | IE]>
      </td>
      </tr>
      </table>
      <![endif]-->
        <!-- ----------- BOTÃO --------- -->
      <!--[if mso | IE]>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" >
      <tr>
      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
      <![endif]-->
        <div  style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
            <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:50px 0 200px 0;text-align:center;">
      <!--[if mso | IE]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
      <tr>
      <td class="" style="vertical-align:top;width:600px;" >
      <![endif]-->
        <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
            <tbody>
              <tr>
                <td  style="background-color:#ffffff;border-radius:20px;vertical-align:top;padding:0 0 20px 0;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                    <tbody>
                      <tr>
                        <td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:190px;line-height:100%;">
                            <tr>
                              <td align="center" bgcolor="#f52523" role="presentation" style="border:none;border-radius:10px;cursor:auto;mso-padding-alt:10px 25px;background:#f52523;" valign="middle">
                                <a href="${frontUrl}/member-invited/${data.hashToVerify}/accept" style="display:inline-block;width:140px;background:#f52523;color:#ffffff;font-family:Montserrat, Arial, sans-serif;font-size:16px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:10px;" target="_blank"> Aceitar convite </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      <!--[if mso | IE]>
      </td>
      </tr>
      </table>
      <![endif]-->
      </td>
      </tr>
      </tbody>
      </table>
      </div>
      <!--[if mso | IE]>
      </td>
      </tr>
      </table>
      <![endif]-->
      </div>
      </body>
      </html>
        `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  sendSignUpMail,
  sendInviteNewUserMail,
}
