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
      from: 'Hubly Retailer No-reply <noreply@gohubly.com>',
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
        <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/confirmar%20email.png" width="327" height="74" /></p>
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
      from: 'Hubly Retailer No-reply <noreply@gohubly.com>',
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
      <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/escolher.png" width="272" height="72" /></p>
      <p>
        <a href="${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/recovery-password/change-password/${data.hashToVerify}">
            <img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/terra.png" width="50%" />
        </a>
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
      from: 'Hubly Retailer No-reply <noreply@gohubly.com>',
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
      <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/aceitar.png" width="275" height="77" /></p>
      <p><img src="https://plugone-production.nyc3.digitaloceanspaces.com/grow-power/terra.png" width="50%" /></p>
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
    from: 'Hubly Retailer No-reply <noreply@gohubly.com>',
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
      from: 'Hubly Retailer No-reply <noreply@gohubly.com>',
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
      <p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAADcCAYAAACGXlNlAAAACXBIWXMAAC4jAAAuIwF4pT92AAALy2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA4LTA1VDExOjMxLTAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wOS0yOFQxNjowNDozNC0wMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wOS0yOFQxNjowNDozNC0wMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxYzVjY2NmNC1kNzM1LTg1NGItYjg3YS02NDM5N2NmYmNmM2IiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5NTBlZmZjZC03MDNlLWM0NGMtOWY0MS0yODNkMzUxY2FhM2MiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxZjcyYzlkMS01Yzc1LWZkNDYtYTg3Yy1lZTg4M2RkZDlmNzYiIHRpZmY6T3JpZW50YXRpb249IjEiIHRpZmY6WFJlc29sdXRpb249IjMwMDAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjMwMDAwMDAvMTAwMDAiIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiIGV4aWY6Q29sb3JTcGFjZT0iMSIgZXhpZjpQaXhlbFhEaW1lbnNpb249IjI3NzgiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIxMjI1Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxZjcyYzlkMS01Yzc1LWZkNDYtYTg3Yy1lZTg4M2RkZDlmNzYiIHN0RXZ0OndoZW49IjIwMjEtMDgtMDVUMTE6MzEtMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4xIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGltYWdlL3BuZyB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NGY1YTFkYy04MmVlLTM5NDUtODM3Mi0yZGYyZjA4Y2Q0MjUiIHN0RXZ0OndoZW49IjIwMjEtMDgtMDVUMTE6MzQ6MjctMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NzdiYzc2N2MtZTAwMy02YzQ0LTk3ZGYtY2ZkYmIxNTY2OWQ5IiBzdEV2dDp3aGVuPSIyMDIxLTA4LTEwVDE1OjUzOjQ3LTAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmY2NDQzN2I2LWU5YjMtY2U0ZC04MDdmLTY4NWEyYjA1ZWMxZSIgc3RFdnQ6d2hlbj0iMjAyMS0wOC0xMFQxNTo1Mzo0Ny0wMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoxYzVjY2NmNC1kNzM1LTg1NGItYjg3YS02NDM5N2NmYmNmM2IiIHN0RXZ0OndoZW49IjIwMjEtMDktMjhUMTY6MDQ6MzQtMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdl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" alt="logo" width="30%" /></p>
      <p>&nbsp;</p>
      <p><strong>Seja muito bem-vindo(a)!</strong></p>
      <p><br />
        Você foi convidado à ultilizar a plataforma de Parceiros Grow Power</p>
      <p>Clique no botão abaixo para aceitar o convite</p>
      <p>&nbsp;</p>
      <p><img src="aceitar.png" width="275" height="77" /></p>
      <p>
        <a href"${getBaseUrl(data?.whiteLabelInfo?.customDomain)}/member-invited/${data.hashToVerify}/accept">
            <img style="background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAABNCAIAAAAKOBfcAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0MzUyLCAyMDIwLzAxLzMwLTE1OjUwOjM4ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTEwLTE4VDA5OjU0OjE3LTAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0xMC0xOFQwOTo1ODo1Mi0wMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0xMC0xOFQwOTo1ODo1Mi0wMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiYmIxNDg5OC1lMzc3LTEyNGItODdjZi00ZTRhZDhmNWIzMGEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpiYWY3Y2EyYi03ZDRjLWUxNGMtYTI4Ny1lNTQ0MDEzZmJkYWIiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiZjlhMTRkNS1hNTQ0LWQ0NGUtYjA2NC1lZTk0OWI5NGY0N2EiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmJmOWExNGQ1LWE1NDQtZDQ0ZS1iMDY0LWVlOTQ5Yjk0ZjQ3YSIgc3RFdnQ6d2hlbj0iMjAyMS0xMC0xOFQwOTo1NDoxNy0wMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYmIxNDg5OC1lMzc3LTEyNGItODdjZi00ZTRhZDhmNWIzMGEiIHN0RXZ0OndoZW49IjIwMjEtMTAtMThUMDk6NTg6NTItMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4xIChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5dcrS9AAAKnElEQVR4nO3de1hT5x0H8F9OEnKBkIQAgVwIYJWLCHIxIIIiaLVudkXn7FpXW52us+pmr7rNVrvu8bZVH13b1dmu6FQetWo324ri/a61Uu6IIggCAcI1XAIkZ38cOEMgJJwHKgm/z8Mfh3Pec97fe8yX8x4SDyySJAEhNEjEky4AIbuEyUGICUwOQkxgchBiApODEBOYHISYwOQgxAQmByEmMDkIMcGx2uLcg/QbZVcL9Hm1LfofoSCEniw3oSxAFhStip3uN2OAZqwBPn1T1az7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');" width="50%" />
        </a>
      </p>
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
