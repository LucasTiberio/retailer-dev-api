import Mail from '../../lib/Mail'
import { ISendMail, ISendRecoveryPasswordMail, IMail, ISendInviteUserMail } from './types'

const frontUrl = 'https://indicaae.lojaintegrada.com.br'

const sendSignUpMail = async (data: ISendMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Loja Integrada No-reply <noreply@gohubly.com>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Bem vindo(a) ao Programa de Afiliados Indica aê! da Loja Integrada!',
      html: `

        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="pt"><head>
        <title>Inscrição confirmada ✅</title>
        <meta property="og:title" content="Inscrição confirmada ✅">
        <meta name="twitter:title" content="Inscrição confirmada ✅">



        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">


        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>

        <style>
        ul > li {
          text-indent: -1em;
        }
        </style>
        <![endif]-->
        <!--[if mso]>
        <style type="text/css">
        body, td {font-family: Arial, Helvetica, sans-serif;}
        </style>
        <![endif]-->









          












        <base href="https://7112881.hubspotpreview-na1.com" target="_blank"><meta name="generator" content="HubSpot"><meta property="og:url" content="http://lojaintegrada-com-br-7112881.hs-sites.com/-temporary-slug-e77e408c-949b-4d7d-b8c9-9318597db5fb?hs_preview=qtkHKKvR-52501536148"><meta name="robots" content="noindex,follow"><!--[if !((mso)|(IE))]><!-- --><style type="text/css">.moz-text-html .hse-column-container{max-width:600px !important;width:600px !important}
        .moz-text-html .hse-column{display:table-cell;vertical-align:top}.moz-text-html .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        [owa] .hse-column-container{max-width:600px !important;width:600px !important}[owa] .hse-column{display:table-cell;vertical-align:top}
        [owa] .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        @media only screen and (min-width:640px){.hse-column-container{max-width:600px !important;width:600px !important}
        .hse-column{display:table-cell;vertical-align:top}.hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        }@media only screen and (max-width:639px){img.stretch-on-mobile,.hs_rss_email_entries_table img,.hs-stretch-cta .hs-cta-img{height:auto !important;width:100% !important}
        .display_block_on_small_screens{display:block}.hs_padded{padding-left:20px !important;padding-right:20px !important}
        }</style><!--<![endif]--><style type="text/css">body[data-outlook-cycle] img.stretch-on-mobile,body[data-outlook-cycle] .hs_rss_email_entries_table img{height:auto !important;width:100% !important}
        body[data-outlook-cycle] .hs_padded{padding-left:20px !important;padding-right:20px !important}
        a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important}
        #outlook a{padding:0}.yshortcuts a{border-bottom:none !important}a{text-decoration:underline}
        .ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%}
        p{margin:0}body{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;moz-osx-font-smoothing:grayscale}</style></head>
        <body bgcolor="#e8e9eb" style="margin:0 !important; padding:0 !important; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">



        <div id="preview_text" style="display:none!important;font-size:1px;color:#e8e9eb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Obaaa! Sua inscrição no evento Sem Tempo Ruim pra Vender está confirmada. Clique aqui e veja mais informações.</div>



        <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">

        <v:fill type="tile" size="100%,100%" color="#e8e9eb"/>

        </v:background>
        <![endif]-->


        <div class="hse-body-background" style="background-color:#e8e9eb" bgcolor="#e8e9eb">
          <table role="presentation" class="hse-body-wrapper-table" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0; padding:0; width:100% !important; min-width:320px !important; height:100% !important" width="100%" height="100%">
            <tbody><tr>
              <td class="hse-body-wrapper-td" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">
                <div id="hs_cos_wrapper_main" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_dnd_area" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="dnd_area">  <div id="section-0" class="hse-section hse-section-first" style="padding-left:10px; padding-right:10px; padding-top:20px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%; padding-bottom:40px">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation">
          <tr style="background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-bottom:40px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-0-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module-0-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 40px 0px; font-size:0px">
                    
                    <img alt="barra_parceiros" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/barra_parceiros.png?width=1040&amp;upscale=true&amp;name=barra_parceiros.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="520" align="middle" class="stretch-on-mobile">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-1" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff" bgcolor="#ffffff">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
          <tr style="background-color:#ffffff;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-1-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module_16285364232301" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:0px; font-size:0px">
                    
                    <img alt="2 email-1" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/2%20email-1.png?width=1120&amp;upscale=true&amp;name=2%20email-1.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="560" align="middle">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module-1-0-3" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module-1-0-3_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
        <p style="mso-line-height-rule:exactly; line-height:175%"><span style="color: #371e56;"><span style="font-weight: bold;">Olá</span>,</span>${data.username}<br><br><span style="color: #371e56;">Hoje começa sua jornada com o Programa de Indicações da Loja Integrada, por isso queremos&nbsp;mostrar tudo que você precisa fazer com a nossa plataforma de indicações.<br></span><br><span style="color: #371e56;">Mas para isso, <span style="font-weight: bold; color: #2bc4c3;">precisamos confirmar seu email</span>. Assim a gente garante com segurança que</span>&nbsp;<span style="color: #371e56;">você é você mesmo.</span></p>
        </div></div></div></td></tr></tbody></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:25px 20px 40px"><div id="hs_cos_wrapper_module_16244795098291" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">































        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0 !important; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:separate!important">
        <tbody><tr>
            <!--[if mso]>
          <td align="center" valign="middle" bgcolor="#2BC4C3" role="presentation"  valign="middle" style="border-radius:25px;cursor:auto;background-color:#2BC4C3;padding:12px 18px;">
        <![endif]-->
        <!--[if !mso]><!-- -->
          <td align="center" valign="middle" bgcolor="#2BC4C3" role="presentation" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; border-radius:25px; cursor:auto; background-color:#2BC4C3">
        <!--<![endif]-->
            <a href="${frontUrl}/verification/${data.hashToVerify}" target="_blank" style="color:#00a4bd; mso-line-height-rule:exactly; font-size:15px; font-family:Helvetica,Arial,sans-serif; Margin:0; text-transform:none; text-decoration:none; padding:12px 18px; display:block" data-hs-link-id="0">
              <strong style="color:#ffffff;font-weight:bold;text-decoration:none;font-style:normal;">Confirmar email e ativar a conta</strong>
            </a>
          </td>
        </tr>
        </tbody></table>
        </div></td></tr></tbody></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module_16280065522411" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module_16280065522411_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
        <h2 style="margin:0; mso-line-height-rule:exactly; font-weight:normal; font-size:15px; line-height:175%; text-align:center" align="center"><span style="color: #371e56;">Obrigado,</span><br><span style="color: #371e56; font-weight: bold;">Equipe Loja Integrada</span></h2>
        </div></div></div></td></tr></tbody></table>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-4" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa" bgcolor="#f2f7fa">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
          <tr style="background-color:#f2f7fa;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-4-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module-4-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 20px 25px; font-size:0px">
                    
                    <img alt="Loja Integrada RGB - Flat - Fundo Branco - LOGO" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png?width=500&amp;upscale=true&amp;name=Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="250" align="middle">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-5" class="hse-section hse-section-last" style="padding-left:10px; padding-right:10px; padding-bottom:20px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa; padding-bottom:40px" bgcolor="#f2f7fa">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
          <tr style="background-color:#f2f7fa;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-bottom:40px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-5-0" class="hse-column hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:12px 20px"><div id="hs_cos_wrapper_module-5-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">









        <!--[if gte mso 9]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:560px; height:2pt;" fillcolor="none">
        <v:fill type="tile"/>
        <v:textbox inset="0,0,0,0">

        <div>

        <![endif]-->
        <table role="presentation" width="100%" align="center" border="0" style="position:relative; top:-1px; min-width:20px; width:100%; max-width:100%; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; font-size:1px">
        <tbody><tr>



        <td width="100%" valign="middle" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; line-height:0; border:transparent; border-bottom:1px solid #CEE2EC; mso-border-bottom-alt:1px solid #CEE2EC; border-bottom-width:1px">&nbsp;</td>


        </tr>
        </tbody></table>

        <!--[if gte mso 9]></div></v:textbox></v:rect><![endif]--></div></td></tr></tbody></table>
        <div id="hs_cos_wrapper_module-5-0-1" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">




































        <table role="presentation" class="hse-footer hse-secondary" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:Arial, sans-serif; font-size:12px; line-height:135%; color:#23496d; margin-bottom:0; padding:0">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; text-align:center; margin-bottom:0; line-height:135%; padding:10px 20px">
                    <p style="mso-line-height-rule:exactly; font-family:Arial, sans-serif; font-size:12px; font-weight:normal; text-decoration:none; font-style:normal; color:#23496d; direction:lrt" dir="lrt">
                      Loja Integrada, Av. Brigadeiro Faria Lima, 4440, São Paulo, São Paulo
                    </p>
                    <p style="mso-line-height-rule:exactly">
                      
                      <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-all-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Cancelar assinatura</a>
                      
                      <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Gerenciar preferências</a>
                      
                    </p>
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>
        </div>
              </td>
            </tr>
          </tbody></table>
        </div>

        </body></html>
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
      from: 'Loja Integrada No-reply <noreply@gohubly.com>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Recuperacão de senha - Programa de Afiliados Indica aê! da Loja Integrada',
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="pt"><head>
        <title>Inscrição confirmada ✅</title>
        <meta property="og:title" content="Inscrição confirmada ✅">
        <meta name="twitter:title" content="Inscrição confirmada ✅">



        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">


        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>

        <style>
        ul > li {
          text-indent: -1em;
        }
        </style>
        <![endif]-->
        <!--[if mso]>
        <style type="text/css">
        body, td {font-family: Arial, Helvetica, sans-serif;}
        </style>
        <![endif]-->









          












        <base href="https://7112881.hubspotpreview-na1.com" target="_blank"><meta name="generator" content="HubSpot"><meta property="og:url" content="http://lojaintegrada-com-br-7112881.hs-sites.com/-temporary-slug-a9027843-dbca-4aa5-b721-4b45da2813ed?hs_preview=VtSjBQJw-52501536883"><meta name="robots" content="noindex,follow"><!--[if !((mso)|(IE))]><!-- --><style type="text/css">.moz-text-html .hse-column-container{max-width:600px !important;width:600px !important}
        .moz-text-html .hse-column{display:table-cell;vertical-align:top}.moz-text-html .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        [owa] .hse-column-container{max-width:600px !important;width:600px !important}[owa] .hse-column{display:table-cell;vertical-align:top}
        [owa] .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        @media only screen and (min-width:640px){.hse-column-container{max-width:600px !important;width:600px !important}
        .hse-column{display:table-cell;vertical-align:top}.hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        }@media only screen and (max-width:639px){img.stretch-on-mobile,.hs_rss_email_entries_table img,.hs-stretch-cta .hs-cta-img{height:auto !important;width:100% !important}
        .display_block_on_small_screens{display:block}.hs_padded{padding-left:20px !important;padding-right:20px !important}
        }</style><!--<![endif]--><style type="text/css">body[data-outlook-cycle] img.stretch-on-mobile,body[data-outlook-cycle] .hs_rss_email_entries_table img{height:auto !important;width:100% !important}
        body[data-outlook-cycle] .hs_padded{padding-left:20px !important;padding-right:20px !important}
        a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important}
        #outlook a{padding:0}.yshortcuts a{border-bottom:none !important}a{text-decoration:underline}
        .ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%}
        p{margin:0}body{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;moz-osx-font-smoothing:grayscale}</style></head>
        <body bgcolor="#e8e9eb" style="margin:0 !important; padding:0 !important; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">



        <div id="preview_text" style="display:none!important;font-size:1px;color:#e8e9eb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Obaaa! Sua inscrição no evento Sem Tempo Ruim pra Vender está confirmada. Clique aqui e veja mais informações.</div>



        <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">

        <v:fill type="tile" size="100%,100%" color="#e8e9eb"/>

        </v:background>
        <![endif]-->


        <div class="hse-body-background" style="background-color:#e8e9eb" bgcolor="#e8e9eb">
          <table role="presentation" class="hse-body-wrapper-table" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0; padding:0; width:100% !important; min-width:320px !important; height:100% !important" width="100%" height="100%">
            <tbody><tr>
              <td class="hse-body-wrapper-td" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">
                <div id="hs_cos_wrapper_main" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_dnd_area" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="dnd_area">  <div id="section-0" class="hse-section hse-section-first" style="padding-left:10px; padding-right:10px; padding-top:20px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%; padding-bottom:40px">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation">
          <tr style="background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-bottom:40px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-0-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module-0-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 40px 0px; font-size:0px">
                    
                    <img alt="barra_parceiros" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/barra_parceiros.png?width=1040&amp;upscale=true&amp;name=barra_parceiros.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="520" align="middle" class="stretch-on-mobile">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section_1628539425859" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff" bgcolor="#ffffff">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
          <tr style="background-color:#ffffff;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column_1628539425859_0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module_16285394257971" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:0px; font-size:0px">
                    
                    <img alt="3 Email" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/3%20Email.png?width=1120&amp;upscale=true&amp;name=3%20Email.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="560" align="middle">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-1" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff; padding-top:20px" bgcolor="#ffffff">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
          <tr style="background-color:#ffffff;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-top:20px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-1-0" class="hse-column hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module-1-0-3" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module-1-0-3_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
        <p style="mso-line-height-rule:exactly; line-height:175%"><span style="color: #371e56;"><span style="font-weight: bold;">Olá</span>,</span>${data.username}<br><br><span style="color: #371e56; font-weight: bold;">Esqueceu sua senha? Não se preocupe, isso acontece</span><br><span style="color: #2bc4c3;">Para escolher uma nova, clique no link abaixo:</span></p>
        </div></div></div></td></tr></tbody></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:25px 20px 40px"><div id="hs_cos_wrapper_module_16244795098291" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">































        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0 !important; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:separate!important">
        <tbody><tr>
            <!--[if mso]>
          <td align="center" valign="middle" bgcolor="#2BC4C3" role="presentation"  valign="middle" style="border-radius:25px;cursor:auto;background-color:#2BC4C3;padding:12px 18px;">
        <![endif]-->
        <!--[if !mso]><!-- -->
          <td align="center" valign="middle" bgcolor="#2BC4C3" role="presentation" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; border-radius:25px; cursor:auto; background-color:#2BC4C3">
        <!--<![endif]-->
            <a href="${frontUrl}/recovery-password/change-password/${data.hashToVerify}" target="_blank" style="color:#00a4bd; mso-line-height-rule:exactly; font-size:15px; font-family:Helvetica,Arial,sans-serif; Margin:0; text-transform:none; text-decoration:none; padding:12px 18px; display:block" data-hs-link-id="0">
              <strong style="color:#ffffff;font-weight:bold;text-decoration:none;font-style:normal;">Escolher nova senha</strong>
            </a>
          </td>
        </tr>
        </tbody></table>
        </div></td></tr></tbody></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module_16280065522411" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module_16280065522411_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
        <h2 style="margin:0; mso-line-height-rule:exactly; font-weight:normal; font-size:15px; line-height:175%; text-align:center" align="center"><span style="color: #371e56;">Obrigado,</span><br><span style="color: #371e56; font-weight: bold;">Equipe Loja Integrada</span></h2>
        </div></div></div></td></tr></tbody></table>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-4" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa" bgcolor="#f2f7fa">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
          <tr style="background-color:#f2f7fa;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-4-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module-4-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 20px 25px; font-size:0px">
                    
                    <img alt="Loja Integrada RGB - Flat - Fundo Branco - LOGO" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png?width=500&amp;upscale=true&amp;name=Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="250" align="middle">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-5" class="hse-section hse-section-last" style="padding-left:10px; padding-right:10px; padding-bottom:20px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa; padding-bottom:40px" bgcolor="#f2f7fa">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
          <tr style="background-color:#f2f7fa;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-bottom:40px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-5-0" class="hse-column hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:12px 20px"><div id="hs_cos_wrapper_module-5-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">









        <!--[if gte mso 9]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:560px; height:2pt;" fillcolor="none">
        <v:fill type="tile"/>
        <v:textbox inset="0,0,0,0">

        <div>

        <![endif]-->
        <table role="presentation" width="100%" align="center" border="0" style="position:relative; top:-1px; min-width:20px; width:100%; max-width:100%; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; font-size:1px">
        <tbody><tr>



        <td width="100%" valign="middle" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; line-height:0; border:transparent; border-bottom:1px solid #CEE2EC; mso-border-bottom-alt:1px solid #CEE2EC; border-bottom-width:1px">&nbsp;</td>


        </tr>
        </tbody></table>

        <!--[if gte mso 9]></div></v:textbox></v:rect><![endif]--></div></td></tr></tbody></table>
        <div id="hs_cos_wrapper_module-5-0-1" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">




































        <table role="presentation" class="hse-footer hse-secondary" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:Arial, sans-serif; font-size:12px; line-height:135%; color:#23496d; margin-bottom:0; padding:0">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; text-align:center; margin-bottom:0; line-height:135%; padding:10px 20px">
                    <p style="mso-line-height-rule:exactly; font-family:Arial, sans-serif; font-size:12px; font-weight:normal; text-decoration:none; font-style:normal; color:#23496d; direction:lrt" dir="lrt">
                      Loja Integrada, Av. Brigadeiro Faria Lima, 4440, São Paulo, São Paulo
                    </p>
                    <p style="mso-line-height-rule:exactly">
                      
                      <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-all-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Cancelar assinatura</a>
                      
                      <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Gerenciar preferências</a>
                      
                    </p>
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>
        </div>
              </td>
            </tr>
          </tbody></table>
        </div>

        </body></html>
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
      from: 'Loja Integrada No-reply <noreply@gohubly.com>',
      to: `${data.username || ''} <${data.email}>`,
      subject: 'Senha recuperada - Programa de Afiliados Indica aê! da Loja Integrada',
      html: `

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="pt"><head>
<title>Inscrição confirmada ✅</title>
<meta property="og:title" content="Inscrição confirmada ✅">
<meta name="twitter:title" content="Inscrição confirmada ✅">



<meta name="x-apple-disable-message-reformatting">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

<meta http-equiv="X-UA-Compatible" content="IE=edge">

<meta name="viewport" content="width=device-width, initial-scale=1.0">


<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
  <o:AllowPNG/>
  <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>

<style>
ul > li {
  text-indent: -1em;
}
</style>
<![endif]-->
<!--[if mso]>
<style type="text/css">
body, td {font-family: Arial, Helvetica, sans-serif;}
</style>
<![endif]-->









  












<base href="https://7112881.hubspotpreview-na1.com" target="_blank"><meta name="generator" content="HubSpot"><meta property="og:url" content="http://lojaintegrada-com-br-7112881.hs-sites.com/-temporary-slug-9b666928-5f84-4ea1-bcf1-7525cc611a3d?hs_preview=IBfsOPbE-52505213453"><meta name="robots" content="noindex,follow"><!--[if !((mso)|(IE))]><!-- --><style type="text/css">.moz-text-html .hse-column-container{max-width:600px !important;width:600px !important}
.moz-text-html .hse-column{display:table-cell;vertical-align:top}.moz-text-html .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
[owa] .hse-column-container{max-width:600px !important;width:600px !important}[owa] .hse-column{display:table-cell;vertical-align:top}
[owa] .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
@media only screen and (min-width:640px){.hse-column-container{max-width:600px !important;width:600px !important}
.hse-column{display:table-cell;vertical-align:top}.hse-section .hse-size-12{max-width:600px !important;width:600px !important}
}@media only screen and (max-width:639px){img.stretch-on-mobile,.hs_rss_email_entries_table img,.hs-stretch-cta .hs-cta-img{height:auto !important;width:100% !important}
.display_block_on_small_screens{display:block}.hs_padded{padding-left:20px !important;padding-right:20px !important}
}</style><!--<![endif]--><style type="text/css">body[data-outlook-cycle] img.stretch-on-mobile,body[data-outlook-cycle] .hs_rss_email_entries_table img{height:auto !important;width:100% !important}
body[data-outlook-cycle] .hs_padded{padding-left:20px !important;padding-right:20px !important}
a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important}
#outlook a{padding:0}.yshortcuts a{border-bottom:none !important}a{text-decoration:underline}
.ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%}
p{margin:0}body{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;moz-osx-font-smoothing:grayscale}</style></head>
<body bgcolor="#e8e9eb" style="margin:0 !important; padding:0 !important; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">



<div id="preview_text" style="display:none!important;font-size:1px;color:#e8e9eb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Obaaa! Sua inscrição no evento Sem Tempo Ruim pra Vender está confirmada. Clique aqui e veja mais informações.</div>



<!--[if gte mso 9]>
<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">

<v:fill type="tile" size="100%,100%" color="#e8e9eb"/>

</v:background>
<![endif]-->


<div class="hse-body-background" style="background-color:#e8e9eb" bgcolor="#e8e9eb">
  <table role="presentation" class="hse-body-wrapper-table" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0; padding:0; width:100% !important; min-width:320px !important; height:100% !important" width="100%" height="100%">
    <tbody><tr>
      <td class="hse-body-wrapper-td" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">
        <div id="hs_cos_wrapper_main" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_dnd_area" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="dnd_area">  <div id="section-0" class="hse-section hse-section-first" style="padding-left:10px; padding-right:10px; padding-top:20px">



<!--[if !((mso)|(IE))]><!-- -->
  <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%; padding-bottom:40px">
<!--<![endif]-->

<!--[if (mso)|(IE)]>
  <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
  <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation">
  <tr style="background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%;">
<![endif]-->

<!--[if (mso)|(IE)]>
<td valign="top" style="width:600px;padding-bottom:40px;">
<![endif]-->
<!--[if gte mso 9]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
<![endif]-->
<div id="column-0-0" class="hse-column hse-size-12">
<div id="hs_cos_wrapper_module-0-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







<table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
<tbody>
    <tr>
        <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 40px 0px; font-size:0px">
            
            <img alt="barra_parceiros" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/barra_parceiros.png?width=1040&amp;upscale=true&amp;name=barra_parceiros.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="520" align="middle" class="stretch-on-mobile">
            
        </td>
    </tr>
</tbody>
</table></div>
</div>
<!--[if gte mso 9]></table><![endif]-->
<!--[if (mso)|(IE)]></td><![endif]-->


<!--[if (mso)|(IE)]></tr></table><![endif]-->

</div>

</div>

<div id="section_1628539447596" class="hse-section" style="padding-left:10px; padding-right:10px">



<!--[if !((mso)|(IE))]><!-- -->
  <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff" bgcolor="#ffffff">
<!--<![endif]-->

<!--[if (mso)|(IE)]>
  <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
  <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
  <tr style="background-color:#ffffff;">
<![endif]-->

<!--[if (mso)|(IE)]>
<td valign="top" style="width:600px;">
<![endif]-->
<!--[if gte mso 9]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
<![endif]-->
<div id="column_1628539447597_0" class="hse-column hse-size-12">
<div id="hs_cos_wrapper_module_16285394475691" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







<table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
<tbody>
    <tr>
        <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:20px 20px 10px; font-size:0px">
            
            <img alt="4 Email" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/4%20Email.png?width=1120&amp;upscale=true&amp;name=4%20Email.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="560" align="middle">
            
        </td>
    </tr>
</tbody>
</table></div>
</div>
<!--[if gte mso 9]></table><![endif]-->
<!--[if (mso)|(IE)]></td><![endif]-->


<!--[if (mso)|(IE)]></tr></table><![endif]-->

</div>

</div>

<div id="section-1" class="hse-section" style="padding-left:10px; padding-right:10px">



<!--[if !((mso)|(IE))]><!-- -->
  <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff; padding-top:20px" bgcolor="#ffffff">
<!--<![endif]-->

<!--[if (mso)|(IE)]>
  <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
  <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
  <tr style="background-color:#ffffff;">
<![endif]-->

<!--[if (mso)|(IE)]>
<td valign="top" style="width:600px;padding-top:20px;">
<![endif]-->
<!--[if gte mso 9]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
<![endif]-->
<div id="column-1-0" class="hse-column hse-size-12">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px 30px"><div id="hs_cos_wrapper_module-1-0-3" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module-1-0-3_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
<p style="mso-line-height-rule:exactly; line-height:175%"><span style="color: #371e56;"><span style="font-weight: bold;">Olá</span>,</span>${data.username}<br><span style="color: #371e56;">A sua senha da plataforma de indicações da LI foi redefinida. Se você fez isso, pode&nbsp;desconsiderar este email de segurança..</span></p>
</div></div></div></td></tr></tbody></table>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module_16280065522411" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module_16280065522411_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
<h2 style="margin:0; mso-line-height-rule:exactly; font-weight:normal; font-size:15px; line-height:175%; text-align:center" align="center"><span style="color: #371e56;">Obrigado,</span><br><span style="color: #371e56; font-weight: bold;">Equipe Loja Integrada</span></h2>
</div></div></div></td></tr></tbody></table>
</div>
<!--[if gte mso 9]></table><![endif]-->
<!--[if (mso)|(IE)]></td><![endif]-->


<!--[if (mso)|(IE)]></tr></table><![endif]-->

</div>

</div>

<div id="section-4" class="hse-section" style="padding-left:10px; padding-right:10px">



<!--[if !((mso)|(IE))]><!-- -->
  <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa" bgcolor="#f2f7fa">
<!--<![endif]-->

<!--[if (mso)|(IE)]>
  <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
  <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
  <tr style="background-color:#f2f7fa;">
<![endif]-->

<!--[if (mso)|(IE)]>
<td valign="top" style="width:600px;">
<![endif]-->
<!--[if gte mso 9]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
<![endif]-->
<div id="column-4-0" class="hse-column hse-size-12">
<div id="hs_cos_wrapper_module-4-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







<table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
<tbody>
    <tr>
        <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 20px 25px; font-size:0px">
            
            <img alt="Loja Integrada RGB - Flat - Fundo Branco - LOGO" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png?width=500&amp;upscale=true&amp;name=Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="250" align="middle">
            
        </td>
    </tr>
</tbody>
</table></div>
</div>
<!--[if gte mso 9]></table><![endif]-->
<!--[if (mso)|(IE)]></td><![endif]-->


<!--[if (mso)|(IE)]></tr></table><![endif]-->

</div>

</div>

<div id="section-5" class="hse-section hse-section-last" style="padding-left:10px; padding-right:10px; padding-bottom:20px">



<!--[if !((mso)|(IE))]><!-- -->
  <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa; padding-bottom:40px" bgcolor="#f2f7fa">
<!--<![endif]-->

<!--[if (mso)|(IE)]>
  <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
  <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
  <tr style="background-color:#f2f7fa;">
<![endif]-->

<!--[if (mso)|(IE)]>
<td valign="top" style="width:600px;padding-bottom:40px;">
<![endif]-->
<!--[if gte mso 9]>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
<![endif]-->
<div id="column-5-0" class="hse-column hse-size-12">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:12px 20px"><div id="hs_cos_wrapper_module-5-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">









<!--[if gte mso 9]>
<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:560px; height:2pt;" fillcolor="none">
<v:fill type="tile"/>
<v:textbox inset="0,0,0,0">

<div>

<![endif]-->
<table role="presentation" width="100%" align="center" border="0" style="position:relative; top:-1px; min-width:20px; width:100%; max-width:100%; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; font-size:1px">
<tbody><tr>



<td width="100%" valign="middle" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; line-height:0; border:transparent; border-bottom:1px solid #CEE2EC; mso-border-bottom-alt:1px solid #CEE2EC; border-bottom-width:1px">&nbsp;</td>


</tr>
</tbody></table>

<!--[if gte mso 9]></div></v:textbox></v:rect><![endif]--></div></td></tr></tbody></table>
<div id="hs_cos_wrapper_module-5-0-1" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">




































<table role="presentation" class="hse-footer hse-secondary" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:Arial, sans-serif; font-size:12px; line-height:135%; color:#23496d; margin-bottom:0; padding:0">
<tbody>
    <tr>
        <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; text-align:center; margin-bottom:0; line-height:135%; padding:10px 20px">
            <p style="mso-line-height-rule:exactly; font-family:Arial, sans-serif; font-size:12px; font-weight:normal; text-decoration:none; font-style:normal; color:#23496d; direction:lrt" dir="lrt">
              Loja Integrada, Av. Brigadeiro Faria Lima, 4440, São Paulo, São Paulo
            </p>
            <p style="mso-line-height-rule:exactly">
              
              <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-all-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Cancelar assinatura</a>
              
              <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Gerenciar preferências</a>
              
            </p>
        </td>
    </tr>
</tbody>
</table></div>
</div>
<!--[if gte mso 9]></table><![endif]-->
<!--[if (mso)|(IE)]></td><![endif]-->


<!--[if (mso)|(IE)]></tr></table><![endif]-->

</div>

</div>
</div>
      </td>
    </tr>
  </tbody></table>
</div>

</body></html>
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
      from: 'Loja Integrada No-reply <noreply@plugone.io>',
      to: `<${data.email}>`,
      subject: 'Programa de Afiliados Indica aê! da Loja Integrada',
      html: `

<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting"
    <title></title>
    <!--[if mso]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </head>
  <body>
    
<div bgcolor="#ffffff" style="margin:0!important;padding:0!important;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word"><span class="im">
    
<div id="m_8418518412346584295preview_text" style="display:none!important;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">A Newsletter de Parceiros é mensal e traz as novidades dos parceiros de Temas, Serviços e Agências da Loja Integrada! Fique por dentro!</div>
    

    </span><div style="background-color:#ffffff" bgcolor="#ffffff">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse;margin:0;padding:0;width:100%!important;min-width:320px!important;height:100%!important" width="100%" height="100%">
        <tbody><tr>
          <td valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word">
            <div id="m_8418518412346584295hs_cos_wrapper_main" style="color:inherit;font-size:inherit;line-height:inherit">  <div id="m_8418518412346584295section-0" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px;padding-top:20px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
    
    
    
    

<div id="m_8418518412346584295column-0-1" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <div id="m_8418518412346584295hs_cos_wrapper_module_16075375198592" style="color:inherit;font-size:inherit;line-height:inherit">
	
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                
                <img alt="header-email-indicaê" src="https://ci6.googleusercontent.com/proxy/v48OVLTOXOogw-crvXmujb2lqxE-TvHgfv9zEGI0O2-BxE3JCk_SEQnCUVXbB8r8lX1V9lyogswbCIrp6OogEK2bWzy5AlGBY2IqJe8YW1YuewlDbHUzYPotODYeX4x08up0RKkKZdWHCJn63SDeG4wxzm-bz2vXrErGA-OhuA1UanPMK0uBiN-z7oqJs6jn2pJuygTdM1j6QVKbcGIy-V6iHBtZEw=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/header-email-indicae%CC%82.png?width=1120&amp;upscale=true&amp;name=header-email-indicae%CC%82.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd">
                
            </td>
        </tr>
    </tbody>
</table>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module_16075375312833" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_8418518412346584295hs_cos_wrapper_module_16075375312833_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>Bem vindo ao Programa de Indicações </strong></p>
<p style="font-size:22px;line-height:150%;text-align:center" align="center"><strong>da Loja Integrada!&nbsp;&nbsp;</strong></p></div></div></td></tr></tbody></table>
<div id="m_8418518412346584295hs_cos_wrapper_module_160821938862919" style="color:inherit;font-size:inherit;line-height:inherit">
	
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:10px 20px;font-size:0px">
                
                <img alt="banner-email-Convite-pro-Afiliado" src="https://ci6.googleusercontent.com/proxy/Ydfo5sLf9NzbC5NAXJnaHoNZB3po7FRH0xWbyv5ZECG0IX0CZ2l7L8Ns_QTzz__ge6Ivx25DycbHbLZUdYQyLL_Deldbwi_EsgghbouzwdLgk75jTAdyaY7fWhmIycjDtF7QvLSfnIOLbuc4RWefUZq1taolKcWnKwJ8eBXdXCUfrtd_ooAWNzTOy0p0cT0JePeY73ngv6xGdWVBr4AHgdq16ZhxI2uQhKIckq9CSsU-X-46=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/banner-email-Convite-pro-Afiliado.png?width=1120&amp;upscale=true&amp;name=banner-email-Convite-pro-Afiliado.png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 1; left: 792px; top: 355.2px;"><div id=":o0" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V" data-tooltip="Fazer o download"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                
            </td>
        </tr>
    </tbody>
</table>
</div>
</div>


    
    </div>
   
  </div>
  <div id="m_8418518412346584295section_1610137974527" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
    
    
    
    

<div id="m_8418518412346584295column_1610137974528_0" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:10px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module_16101379887913" style="color:inherit;font-size:inherit;line-height:inherit"><div id="m_8418518412346584295hs_cos_wrapper_module_16101379887913_" style="color:inherit;font-size:inherit;line-height:inherit"><p style="line-height:175%"><span style="color:#738096">Olá!&nbsp;</span></p>
<p style="line-height:175%">&nbsp;</p>
<p style="line-height:175%"><span style="color:#738096">Seja bem-vindo ao Programa de Indicação da Loja Integrada, via nosso parceiro de tecnologia Plugone.&nbsp;</span></p>
<p style="line-height:175%">&nbsp;</p>
<p style="line-height:175%"><span style="color:#738096">Você recebeu o convite para participar do Programa de Indicação da Loja Integrada. Clique abaixo para aceitar. </span></p></div></div></td></tr></tbody></table>
</div>


    
    </div>
   
  </div>
  <div id="m_8418518412346584295section_1610138015341" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;background-color:#ffffff" bgcolor="#ffffff">
    
    
    
    

<div id="m_8418518412346584295column_1610138015341_0" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:19px 20px 10px 18px"><div id="m_8418518412346584295hs_cos_wrapper_module_160821926267616" style="color:inherit;font-size:inherit;line-height:inherit">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0!important;border-collapse:separate!important">
    <tbody><tr>
        
    
      <td align="center" valign="middle" bgcolor="#42C0C4" role="presentation" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;border-radius:5px;background-color:#42c0c4">
   
        <a href="${frontUrl}/member-invited/${data.hashToVerify}/accept" style="font-size:16px;font-family:Arial,sans-serif;color:#ffffff;font-weight:normal;text-decoration:none;font-style:normal;Margin:0;text-transform:none;padding:12px 18px;display:block">
          Aceitar convite
        </a>
      </td>
    </tr>
  </tbody></table>
</div></td></tr></tbody></table>
</div>


    
    </div>
   
  </div><span class="im">
  <div id="m_8418518412346584295section-1" class="m_8418518412346584295hse-section" style="padding-left:10px;padding-right:10px;padding-bottom:20px">
    
    
    
      <div class="m_8418518412346584295hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0">
    
    
    
    

<div id="m_8418518412346584295column-1-1" class="m_8418518412346584295hse-column m_8418518412346584295hse-size-12">
  <div id="m_8418518412346584295hs_cos_wrapper_module_160821833507510" style="color:inherit;font-size:inherit;line-height:inherit">
	
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0!important;border-collapse:collapse">
    <tbody>
        <tr>
            <td align="center" valign="top" style="border-collapse:collapse;font-family:Arial,sans-serif;color:#23496d;word-break:break-word;text-align:center;padding:0px 20px;font-size:0px">
                
                <img alt="footer-2 (1)" src="https://ci4.googleusercontent.com/proxy/Jgc5jYutFAhzj_yYWtfKOVQ1RGpJCXk1fU0odc59bPLPdHer5JOWM-UdTLJdWelw3P2PgLOJo83FFItfncDvFwQvrmBB_BKpcr7cx6o4cGfGd1QxgV2aGST22LUCvR3QWVkXH8hrnONckCpHjVUjLY25Y_snIBzJKmyr2DSC4gM48HXdMNvDJ18vId0e=s0-d-e1-ft#https://hs-7112881.f.hubspotemail.net/hub/7112881/hubfs/footer-2%20(1).png?width=1120&amp;upscale=true&amp;name=footer-2%20(1).png" style="outline:none;text-decoration:none;max-width:100%;font-size:16px" width="560" align="middle" class="CToWUd a6T" tabindex="0"><div class="a6S" dir="ltr" style="opacity: 0.01;"><div id=":o1" class="T-I J-J5-Ji aQv T-I-ax7 L3 a5q" title="Fazer o download" role="button" tabindex="0" aria-label="Fazer o download do anexo " data-tooltip-class="a1V"><div class="akn"><div class="aSK J-J5-Ji aYr"></div></div></div></div>
                
            </td>
        </tr>
    </tbody>
</table>
</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0!important;border-collapse:collapse"><tbody><tr><td class="m_8418518412346584295hs_padded" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px;color:#23496d;word-break:break-word;padding:0px 20px"><div id="m_8418518412346584295hs_cos_wrapper_module-1-1-1" style="color:inherit;font-size:inherit;line-height:inherit">

</div></td></tr></tbody></table>
</div>


    
    </div>
   
  </div>
</span></div>
          </td>
        </tr>
      </tbody></table>
    </div>
  
<img src="https://ci3.googleusercontent.com/proxy/KLZcA37Ruhj2SGQultN0JtPY7JUxlovwGDGLjG5Fc_zyM5U2xP5PgqFAgxJkuRLmMRas-XsWLzbXYJhzCmKQKDz31zoAENRAVgaIVnYVAJ49qNCE8C5DNxA-ZgiMXKxU1NcN3mH4YA=s0-d-e1-ft#https://i7.t.hubspotemail.net/e2t/to/VW9rW315v05wW4qdSHr8JW_bqW5_BCzp4lLJjvf9k7LYD22" alt="" width="1" height="1" border="0" style="display:none!important;min-height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important" class="CToWUd"></div>
  </body>
</html>
                `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const sendInviteNewUserMail = async (data: ISendInviteUserMail) => {
  if (process.env.NODE_ENV === 'test') return

  try {
    await Mail.sendMail({
      from: 'Hubly No-reply <noreply@gohubly.com>',
      to: `<${data.email}>`,
      subject: 'Programa de Afiliados Indica aê! da Loja Integrada',
      html: `

        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" lang="pt"><head>
        <title>Inscrição confirmada ✅</title>
        <meta property="og:title" content="Inscrição confirmada ✅">
        <meta name="twitter:title" content="Inscrição confirmada ✅">



        <meta name="x-apple-disable-message-reformatting">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">


        <!--[if gte mso 9]>
        <xml>
          <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>

        <style>
        ul > li {
          text-indent: -1em;
        }
        </style>
        <![endif]-->
        <!--[if mso]>
        <style type="text/css">
        body, td {font-family: Arial, Helvetica, sans-serif;}
        </style>
        <![endif]-->









          












        <base href="https://7112881.hubspotpreview-na1.com" target="_blank"><meta name="generator" content="HubSpot"><meta property="og:url" content="http://lojaintegrada-com-br-7112881.hs-sites.com/-temporary-slug-de7969af-ef3e-47cf-b082-8252813e8ca3?hs_preview=WGIdvPwp-52500597031"><meta name="robots" content="noindex,follow"><!--[if !((mso)|(IE))]><!-- --><style type="text/css">.moz-text-html .hse-column-container{max-width:600px !important;width:600px !important}
        .moz-text-html .hse-column{display:table-cell;vertical-align:top}.moz-text-html .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        [owa] .hse-column-container{max-width:600px !important;width:600px !important}[owa] .hse-column{display:table-cell;vertical-align:top}
        [owa] .hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        @media only screen and (min-width:640px){.hse-column-container{max-width:600px !important;width:600px !important}
        .hse-column{display:table-cell;vertical-align:top}.hse-section .hse-size-12{max-width:600px !important;width:600px !important}
        }@media only screen and (max-width:639px){img.stretch-on-mobile,.hs_rss_email_entries_table img,.hs-stretch-cta .hs-cta-img{height:auto !important;width:100% !important}
        .display_block_on_small_screens{display:block}.hs_padded{padding-left:20px !important;padding-right:20px !important}
        }</style><!--<![endif]--><style type="text/css">body[data-outlook-cycle] img.stretch-on-mobile,body[data-outlook-cycle] .hs_rss_email_entries_table img{height:auto !important;width:100% !important}
        body[data-outlook-cycle] .hs_padded{padding-left:20px !important;padding-right:20px !important}
        a[x-apple-data-detectors]{color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important}
        #outlook a{padding:0}.yshortcuts a{border-bottom:none !important}a{text-decoration:underline}
        .ExternalClass{width:100%}.ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{line-height:100%}
        p{margin:0}body{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-webkit-font-smoothing:antialiased;moz-osx-font-smoothing:grayscale}</style></head>
        <body bgcolor="#e8e9eb" style="margin:0 !important; padding:0 !important; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">



        <div id="preview_text" style="display:none!important;font-size:1px;color:#e8e9eb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Obaaa! Sua inscrição no evento Sem Tempo Ruim pra Vender está confirmada. Clique aqui e veja mais informações.</div>



        <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">

        <v:fill type="tile" size="100%,100%" color="#e8e9eb"/>

        </v:background>
        <![endif]-->


        <div class="hse-body-background" style="background-color:#e8e9eb" bgcolor="#e8e9eb">
          <table role="presentation" class="hse-body-wrapper-table" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; margin:0; padding:0; width:100% !important; min-width:320px !important; height:100% !important" width="100%" height="100%">
            <tbody><tr>
              <td class="hse-body-wrapper-td" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word">
                <div id="hs_cos_wrapper_main" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_dnd_area" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="dnd_area">  <div id="section-0" class="hse-section hse-section-first" style="padding-left:10px; padding-right:10px; padding-top:20px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%; padding-bottom:40px">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation">
          <tr style="background-image:url('https://f.hubspotusercontent30.net/hubfs/7112881/bg_2_color-07.png'); background-position:center; background-repeat:no-repeat; background-size:100% 100%;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-bottom:40px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-0-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module-0-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 40px 0px; font-size:0px">
                    
                    <img alt="barra_parceiros" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/barra_parceiros.png?width=1040&amp;upscale=true&amp;name=barra_parceiros.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="520" align="middle" class="stretch-on-mobile">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section_1628515426756" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff" bgcolor="#ffffff">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
          <tr style="background-color:#ffffff;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column_1628515426756_0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module_16285154267341" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:0px; font-size:0px">
                    
                    <img alt="shutterstock_1343163848-1" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/shutterstock_1343163848-1.png?width=1200&amp;upscale=true&amp;name=shutterstock_1343163848-1.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="600" align="middle">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-1" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#ffffff; padding-top:20px" bgcolor="#ffffff">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#ffffff">
          <tr style="background-color:#ffffff;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-top:20px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-1-0" class="hse-column hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module-1-0-3" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module-1-0-3_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
        <p style="mso-line-height-rule:exactly; line-height:175%"><span style="color: #371e56; font-weight: bold;">Bem vindo(a) ao Programa de Parcerias da Loja Integrada!&nbsp;<br><br></span></p>
        <p style="mso-line-height-rule:exactly; line-height:175%"><span style="color: #371e56;">Você foi convidado para utilizar a plataforma de indicações da LI, <br>porque faz parte do nosso ecossistema e é nosso parceiro de indicações <br>ou é parceiro de vendas no nosso marketplace. <br><br><span style="font-weight: bold;">Clique abaixo para aceitar o convite e indicar novas lojas <br>para a Loja Integrada.</span></span></p>
        </div></div></div></td></tr></tbody></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:25px 20px 40px"><div id="hs_cos_wrapper_module_16244795098291" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">































        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-spacing:0 !important; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:separate!important">
        <tbody><tr>
            <!--[if mso]>
          <td align="center" valign="middle" bgcolor="#2BC4C3" role="presentation"  valign="middle" style="border-radius:25px;cursor:auto;background-color:#2BC4C3;padding:12px 18px;">
        <![endif]-->
        <!--[if !mso]><!-- -->
          <td align="center" valign="middle" bgcolor="#2BC4C3" role="presentation" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; border-radius:25px; cursor:auto; background-color:#2BC4C3">
        <!--<![endif]-->
            <a href="${frontUrl}/member-invited/${data.hashToVerify}/accept" target="_blank" style="color:#00a4bd; mso-line-height-rule:exactly; font-size:15px; font-family:Helvetica,Arial,sans-serif; Margin:0; text-transform:none; text-decoration:none; padding:12px 18px; display:block" data-hs-link-id="0">
              <strong style="color:#ffffff;font-weight:bold;text-decoration:none;font-style:normal;">Aceitar o convite da LI</strong>
            </a>
          </td>
        </tr>
        </tbody></table>
        </div></td></tr></tbody></table>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:10px 40px"><div id="hs_cos_wrapper_module_16280065522411" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module"><div id="hs_cos_wrapper_module_16280065522411_" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_rich_text" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="rich_text"><div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%">
        <h2 style="margin:0; mso-line-height-rule:exactly; font-weight:normal; font-size:15px; line-height:175%"><span style="color: #371e56;">Qualquer dúvida, acesse a nossa central de ajuda&nbsp;<a href="https://ajuda.lojaintegrada.com.br/pt-BR/articles/5002960-faq-do-programa-de-indicacao-da-loja-integrada-indica-ae" rel="noopener" style="color:#00a4bd; mso-line-height-rule:exactly" data-hs-link-id="0" target="_blank"><span style="text-decoration: underline; color: #2bc4c3;"><span style="font-weight: bold;">aqui</span></span></a>.</span></h2>
        </div>
        <div style="mso-line-height-rule:exactly; font-size:15px; line-height:150%"><span style="color: #371e56;">&nbsp;</span></div></div></div></td></tr></tbody></table>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-4" class="hse-section" style="padding-left:10px; padding-right:10px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa" bgcolor="#f2f7fa">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
          <tr style="background-color:#f2f7fa;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-4-0" class="hse-column hse-size-12">
        <div id="hs_cos_wrapper_module-4-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">







        <table class="hse-image-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; color:#23496d; word-break:break-word; text-align:center; padding:40px 20px 25px; font-size:0px">
                    
                    <img alt="Loja Integrada RGB - Flat - Fundo Branco - LOGO" src="https://f.hubspotusercontent30.net/hub/7112881/hubfs/Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png?width=500&amp;upscale=true&amp;name=Loja%20Integrada%20RGB%20-%20Flat%20-%20Fundo%20Branco%20-%20LOGO.png" style="outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; max-width:100%; font-size:16px" width="250" align="middle">
                    
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>

        <div id="section-5" class="hse-section hse-section-last" style="padding-left:10px; padding-right:10px; padding-bottom:20px">



        <!--[if !((mso)|(IE))]><!-- -->
          <div class="hse-column-container" style="min-width:280px; max-width:600px; width:100%; Margin-left:auto; Margin-right:auto; border-collapse:collapse; border-spacing:0; background-color:#f2f7fa; padding-bottom:40px" bgcolor="#f2f7fa">
        <!--<![endif]-->

        <!--[if (mso)|(IE)]>
          <div class="hse-column-container" style="min-width:280px;max-width:600px;width:100%;Margin-left:auto;Margin-right:auto;border-collapse:collapse;border-spacing:0;">
          <table align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;" cellpadding="0" cellspacing="0" role="presentation" width="600" bgcolor="#f2f7fa">
          <tr style="background-color:#f2f7fa;">
        <![endif]-->

        <!--[if (mso)|(IE)]>
        <td valign="top" style="width:600px;padding-bottom:40px;">
        <![endif]-->
        <!--[if gte mso 9]>
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px">
        <![endif]-->
        <div id="column-5-0" class="hse-column hse-size-12">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt"><tbody><tr><td class="hs_padded" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; padding:12px 20px"><div id="hs_cos_wrapper_module-5-0-0" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">









        <!--[if gte mso 9]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:560px; height:2pt;" fillcolor="none">
        <v:fill type="tile"/>
        <v:textbox inset="0,0,0,0">

        <div>

        <![endif]-->
        <table role="presentation" width="100%" align="center" border="0" style="position:relative; top:-1px; min-width:20px; width:100%; max-width:100%; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; font-size:1px">
        <tbody><tr>



        <td width="100%" valign="middle" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; line-height:0; border:transparent; border-bottom:1px solid #CEE2EC; mso-border-bottom-alt:1px solid #CEE2EC; border-bottom-width:1px">&nbsp;</td>


        </tr>
        </tbody></table>

        <!--[if gte mso 9]></div></v:textbox></v:rect><![endif]--></div></td></tr></tbody></table>
        <div id="hs_cos_wrapper_module-5-0-1" class="hs_cos_wrapper hs_cos_wrapper_widget hs_cos_wrapper_type_module" style="color: inherit; font-size: inherit; line-height: inherit;" data-hs-cos-general-type="widget" data-hs-cos-type="module">




































        <table role="presentation" class="hse-footer hse-secondary" width="100%" cellpadding="0" cellspacing="0" style="border-spacing:0 !important; border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; font-family:Arial, sans-serif; font-size:12px; line-height:135%; color:#23496d; margin-bottom:0; padding:0">
        <tbody>
            <tr>
                <td align="center" valign="top" style="border-collapse:collapse; mso-line-height-rule:exactly; font-family:Helvetica, Arial, sans-serif; font-size:15px; color:#23496d; word-break:break-word; text-align:center; margin-bottom:0; line-height:135%; padding:10px 20px">
                    <p style="mso-line-height-rule:exactly; font-family:Arial, sans-serif; font-size:12px; font-weight:normal; text-decoration:none; font-style:normal; color:#23496d; direction:lrt" dir="lrt">
                      Loja Integrada, Av. Brigadeiro Faria Lima, 4440, São Paulo, São Paulo
                    </p>
                    <p style="mso-line-height-rule:exactly">
                      
                      <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-all-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Cancelar assinatura</a>
                      
                      <a data-unsubscribe="true" href="https://hs-7112881.s.hubspotemail.net/hs/manage-preferences/unsubscribe-test?d=VmYj7r5ktjMvVKgD3Q3_YlyBW2m3bL73_YlyBN1JxwY5GKd_PM20N87dV8q-W5l9vhV833nlGF5XCN4jYfn61&amp;v=3" style="mso-line-height-rule:exactly; font-family:Helvetica,Arial,sans-serif; font-size:12px; color:#00a4bd; font-weight:normal; text-decoration:underline; font-style:normal" data-hs-link-id="0" target="_blank">Gerenciar preferências</a>
                      
                    </p>
                </td>
            </tr>
        </tbody>
        </table></div>
        </div>
        <!--[if gte mso 9]></table><![endif]-->
        <!--[if (mso)|(IE)]></td><![endif]-->


        <!--[if (mso)|(IE)]></tr></table><![endif]-->

        </div>

        </div>
        </div>
              </td>
            </tr>
          </tbody></table>
        </div>

        </body></html>
      `,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

export default {
  sendSignUpMail,
  sendRecoveryPasswordMail,
  sendRecoveredPasswordMail,
  sendInviteUserMail,
  sendInviteNewUserMail,
}
